import os
import webview
import strings
import jsondic

class Api:
    def __init__(self) -> None:
        self._window=webview.active_window()
        try:
            self.directory=conf["dir"]
        except KeyError:
            self.directory=""
        self.filename=os.path.join(self.directory, "new-document.md")
        self.firstfilename=self.filename

    def name(self):
        return os.path.basename(self.filename)

    def openfile(self) -> None:
        file_types: list = ('Math files (*.md;*.txt;*.math)', 'All files (*.*)')
        win=webview.active_window()
        result=window.create_file_dialog(webview.OPEN_DIALOG, allow_multiple=False, file_types=file_types, directory=self.directory)
        if result is None:
            return ""
        self.filename=result[0]
        conf["dir"]=(os.path.dirname(self.filename[0]),)
        conf.save()
        with open(result[0], "r", encoding="UTF-8") as f:
            return f.read()

    def savefile(self, data: str) -> None:
        if self.filename==self.firstfilename:
            win: webview.Window=webview.active_window()
            file_types: list = ('Math files (*.md;*.txt;*.math)', 'All files (*.*)')
            result=win.create_file_dialog(webview.SAVE_DIALOG, self.directory, False, "*.md", file_types)
            self.filename=result
        with open(self.filename, "w", encoding="UTF-8") as f:
            f.write(data)


    def exporthtml(self, htmldata: str) -> None:
        with open(os.path.splitext(self.filename)[0]+".html", "w", encoding="UTF-8") as f:
            f.write(strings.makehtml(htmldata))

def youreallywanttosave() -> None:
    win: webview.Window=webview.active_window()
    yep=win.create_confirmation_dialog("Сохранение", "Сохранить последние изменения?")
    if yep:
        api.savefile(win.get_elements("#mdeditor__textarea")['innerHTML'])

def main(window: webview.Window) -> None:
    pass



if __name__ == '__main__':
    conf=jsondic.JSON("config.json")
    api=Api()
    window = webview.create_window('редактор математики', 'web/index.html', js_api=api)
    webview.start(main, window, debug=False)