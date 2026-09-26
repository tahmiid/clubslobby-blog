// JPEG frames → H.264 MP4 at a constant frame rate, with nothing but the
// system's AVFoundation (this Mac has no ffmpeg). Used by make-reel-clips.mjs.
//
//   swift gen/frames-to-mp4.swift <list.txt> <out.mp4> <fps>
//
// list.txt holds one JPEG path per output frame (a path repeats to hold a
// frame); the size of the first frame is the size of the video.
import AVFoundation
import CoreGraphics
import Foundation
import ImageIO

let args = CommandLine.arguments
guard args.count == 4, let fps = Int32(args[3]) else {
  FileHandle.standardError.write("usage: frames-to-mp4.swift <list.txt> <out.mp4> <fps>\n".data(using: .utf8)!)
  exit(2)
}
let paths = try String(contentsOfFile: args[1], encoding: .utf8).split(separator: "\n").map(String.init)
let out = URL(fileURLWithPath: args[2])
try? FileManager.default.removeItem(at: out)

func load(_ p: String) -> CGImage {
  let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: p) as CFURL, nil)!
  return CGImageSourceCreateImageAtIndex(src, 0, nil)!
}
let first = load(paths[0])
let w = first.width, h = first.height

let writer = try AVAssetWriter(outputURL: out, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: w,
  AVVideoHeightKey: h,
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: 12_000_000,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
  ],
])
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
  kCVPixelBufferWidthKey as String: w,
  kCVPixelBufferHeightKey as String: h,
])
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

var cache: (String, CVPixelBuffer)? = nil
func buffer(_ p: String) -> CVPixelBuffer {
  if let c = cache, c.0 == p { return c.1 }
  var pb: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
  let buf = pb!
  CVPixelBufferLockBaseAddress(buf, [])
  let ctx = CGContext(data: CVPixelBufferGetBaseAddress(buf), width: w, height: h, bitsPerComponent: 8,
                      bytesPerRow: CVPixelBufferGetBytesPerRow(buf), space: CGColorSpaceCreateDeviceRGB(),
                      bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
  ctx.draw(load(p), in: CGRect(x: 0, y: 0, width: w, height: h))
  CVPixelBufferUnlockBaseAddress(buf, [])
  cache = (p, buf)
  return buf
}

for (i, p) in paths.enumerated() {
  while !input.isReadyForMoreMediaData { usleep(2000) }
  adaptor.append(buffer(p), withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps))
}
input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
if writer.status != .completed {
  FileHandle.standardError.write("write failed: \(String(describing: writer.error))\n".data(using: .utf8)!)
  exit(1)
}
