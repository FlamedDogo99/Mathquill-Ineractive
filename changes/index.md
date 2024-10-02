## This is a record of the changes implemented in this build of mathquill.min.js 
- `src/commands/text.ts` 
    - Re-added creating text box through `$`
- `src/commands/math/basicSymbols.ts`
   - Added matrix support but it is _god awful_
        - Abuses stacked superscripts and subscripts and uses the `prompt()` function for setting the size of the matrix 
        - I would be ashamed if someone should this to me later in life. It is the laziest, mostly poorly executed way to go about this.
