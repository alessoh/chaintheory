import sys
pub = open(sys.argv[1], encoding='utf-8').read()
loc = open(sys.argv[2], encoding='utf-8').read()
i = pub.find(loc)
print("local page found verbatim inside published file:", i >= 0, "at offset", i)
if i >= 0:
    print("--- wrapper before ---"); print(pub[:i])
    print("--- wrapper after ---"); print(pub[i + len(loc):])
else:
    # find first difference after locating the title
    j = pub.find('<title>'); k = loc.find('<title>')
    n = 0
    while j + n < len(pub) and k + n < len(loc) and pub[j + n] == loc[k + n]: n += 1
    print("first difference after", n, "matching chars:", repr(pub[j + n - 60:j + n + 60]), "vs", repr(loc[k + n - 60:k + n + 60]))
