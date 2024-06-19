import json

# work with json as you never thaught! Well, no more low level, just work with it as a dict!
class JSON:
    def __init__(self, filename: str) -> None:
        try:
            with open(filename, "r", encoding="UTF-8") as f:
                self.j=json.loads(f.read())
        except:
            with open(filename, "w", encoding="UTF-8") as f: f.write("{}")
            self.j={}
        self.filename=filename

    def save(self) -> None:
        with open(self.filename, "w", encoding="UTF-8") as f:
            f.write(json.dumps(self.j, indent=2))

    def __getitem__(self, k):
        return self.j[k]

    def __setitem__(self, k, v):
        if isinstance(k, tuple) and len(k)==1 and (isinstance(k[0], str) or isinstance(k, int)):
            self.j[k[0]]=v
            self.save()
            return self
        elif isinstance(k, str) or isinstance(k, int):
            self.j[k]=v
        return self

    def keys(self):
        return self.j.keys()

    def values(self):
        return self.j.values()

    def items(self):
        return self.j.items()

    def update(self, other_dict):
        self.j.update(other_dict)
        self.save()
        return self

    def pop(self, k):
        val=self.j.pop(k)
        self.save()
        return val

    def popitem(self):
        item=self.j.popitem()
        self.save()
        return item

    def clear(self):
        self.j.clear()
        self.save()
        return self

    def copy(self):
        return dict(self.j)

    def len(self):
        return len(self.j)

    def contains(self, k):
        return k in self.j

    def iter(self):
        return iter(self.j)

    def str(self):
        return json.dumps(self.j, indent=2)

    def repr(self):
        return f"JSON({self.filename}): {str(self.j)}"