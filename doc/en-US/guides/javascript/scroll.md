> *If you find some missing information or errors in any of the translations, help us by opening a [pull request](https://github.com/gbaptista/luminous/pulls) with the necessary modifications in the texts.*

# Guides
> [back to index](../)

## scroll
> en-US | [es](../../../es/guides/javascript/scroll.md) | [pt-BR](../../../pt-BR/guides/javascript/scroll.md)

The [`scroll`](https://developer.mozilla.org/en-US/docs/Web/Events/scroll) event is fired each time you scroll the webpage, whether vertical or horizontally.

See also: [The `mousemove` JavaScript event](./mousemove.md). It may be helpful to read about `mousemove` first as this page builds on information presented in it.

`scroll` is used by some websites to determine when you have reached the bottom of the page 
in order to load more content (this is called "lazy loading"), but similar to `mousemove`, 
it is also used to determine how far you've scrolled in the page for analytics purposes.

Just as with mousemove, there are a number of similar events, such as `wheel`, `mousewheel` (and its synonym, `mouseWheel`), and less commonly,
`MozMousePixelScroll` for Mozilla's browsers (namely Firefox).
