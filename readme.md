# Math editor
## A simple web-based editor for mathematics, mainly used as a tool for doing simple but beautiful, screenreader accessible and visually good looking maths.
This app uses my own implementation of markdown which uses the showdown js library and a creapy extension.
Instead of interpreting backticks (`) as code blocks, it passes them to mathjax as asciimath.
You write your math in markdown, it automatically shows up the preview on how will it actually be shown up on the screen.
To publish or share your ready beautiful math text to someone, just save it's html using the corresponding button!

# How the math really looks?
Well, github markdown can interpret mathjax but don't use the readme.md file to copy the latex code, because my own implementation uses asciimath. This file is only for github.
$$\sqrt{2x^2+3x+7} \over \cbrt{x+3}$$

# installation and usage:
pip install pywebview
and that's all! just run main.py and an editor will be shown! You can open, save and export html and edit the markdown files.

# syntax
well, I think you need to learn basics of markdown and go to the [asciimath](asciimath.org) website for that. The sample markdown is included in the repository.
```markdown
# this is a heading
## this is a level2 heading
`sqrt3+sin(x+pi) =0`
```

There are no special syntax rules for that. Use backticks for asciimath delimiters and the very common, very beautiful markdown syntax.
