## Mathquill with extra functionality
> [!NOTE]  
> This is a personal project and is not documented, commented, or set up for group developement.

## Adds
- Environment support
   - `\begin{environment}` and `\end{environment}`
   - Used by matrix and cases
- Matrix support
   - `\matrix`, `\pmatrix`, `\bmatrix`, `\Bmatrix`, `\vmatrix`, `\Vmatrix`
- Cases support
   - `\cases`
- Adds `mod` to autocommands
- Adds `\nequiv` as a binary operator
- Adds `nmid` as a bindVanillaSymbol
- Legacy fake matrix command
   - Abuses `_{}` and `^{}` to visually recreate matrices
   - Viewable on unmodified builds of mathquill
   - `\fmatrix`, `\fpmatrix`, `\fbmatrix`, `\fBmatrix`, `\fvmatrix`, and `\fVmatrix`
- Undo and Redo handling
   - <kbd>Command Z</kbd>, <kbd>Control Z</kbd> or pressing `undo` undoes the previous action
   - <kbd>Command Shift Z</kbd>, <kbd>Control Shift Z</kbd> or pressing `redo` redoes the previous action
- Newline functionality
   - Pressing <kbd>return</kbd> will enter a new line, which is represented by latex's `\newline` character
## Credit
- [Mathquill](https://github.com/mathquill/mathquill)
- [String Difference](https://github.com/google/diff-match-patch)
- [Multiline Mathquill](https://edu-mat.sakuraweb.com/matheditor/MathQuillWithLineBreaks.html)
- [Latex Edit Binding](https://digabi.github.io/mathquill/test/demo.html)
- [Original (obsolete) Learnosity matrix branch](https://github.com/Learnosity/mathquill/tree/matrix-minimal)
- [My rewrite of the Learnosity matrix branch](https://github.com/FlamedDogo99/mathquill)

## License
None
