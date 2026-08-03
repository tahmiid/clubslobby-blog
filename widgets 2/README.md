# Widget files — paste these into Ghost's editor

Ghost(Pro)'s **importer** flattens HTML cards: the markup, `<style>` and
`<script>` are stripped and only the text survives. Ghost's **editor** HTML card
does not do this — it renders raw HTML exactly as given, which is how embeds
normally work on Ghost(Pro).

So: import the articles for the prose, then add each widget by hand, once.

## Which file goes where

| File | Post |
|---|---|
| `1-archetype-browser.html` | EA FC Pro Clubs Archetypes Explained: All 13, Side by Side |
| `2-comparison-heatmap.html` | EA FC Pro Clubs Archetypes Compared: Every Ceiling, Side by Side |
| `3-archetype-quiz.html` | Which EA FC Pro Clubs Archetype Should You Play? |
| `4-accelerate-calculator.html` | Explosive, Lengthy or Controlled *(keep as draft)* |

## Steps, per post

1. Open the post in the Ghost editor.
2. **Delete the flattened text block** the import left behind — the run of loose
   text where the tool should be. It sits between the opening paragraph and the
   first `<h2>`. Everything from the tool's own heading (e.g. "Which archetype
   should you play?") down to the small print line ending "…normalised across
   the outfield pool." is widget debris and should go.
3. Put the cursor on the empty line directly after the **first paragraph** —
   the tool belongs above all the prose, not below it.
4. Type `/html` and press Enter to insert an HTML card.
5. Paste the entire contents of the file into the card.
6. Click outside the card. You should see the tool render immediately in the
   editor preview.
7. Update the post.

## Checking it worked

The card should render as a bordered box with a title, not as plain text. On the
quiz, clicking a chip should change the results instantly. If it renders styled
but nothing responds to clicks, the script is being blocked rather than
stripped — say so, because that is a different problem with a different fix.

## Do not

- Do not include `<!--kg-card-begin: html-->` markers. Those are only meaningful
  to the HTML-source API path; in the editor they are just a stray comment.
- Do not paste into a normal paragraph — it must be an HTML card, or Ghost will
  escape the markup and you will get the tool's source code as visible text.
