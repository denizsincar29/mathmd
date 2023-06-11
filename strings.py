html="""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Математика</title>
<script>
// let\s configure mathjax and define that we want to use ascii math, because it is set to latex by default
MathJax = {
loader: {load: ['input/asciimath', 'output/chtml', 'ui/menu']},
};
</script>
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
12345
</body>
</html>"""

def makehtml(data):
    return html.replace("12345", data)