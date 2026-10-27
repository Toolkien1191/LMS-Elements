# Rebuilds penrose.html from src.html + three.js r170, so the page needs no outside requests.
# Get the library:  npm pack three@0.170.0 && tar xzf three-0.170.0.tgz   (gives package/build/three.module.min.js)
# Run:  python3 build.py [path/to/three.module.min.js]
import sys
src = open(sys.argv[1] if len(sys.argv) > 1 else 'package/build/three.module.min.js').read()
i = src.rindex('export{'); body = src[:i]; exp = src[i+7:src.rindex('}')]
pairs = []
for p in exp.split(','):
    p = p.strip(); a, b = (p.split(' as ') if ' as ' in p else (p, p))
    pairs.append(f'{b.strip()}:{a.strip()}')
three = 'var THREE=(function(){"use strict";\n' + body + '\nreturn {' + ','.join(pairs) + '};})();'  # plain script, no module/blob import
assert '</script' not in three
out = open('src.html').read().replace('/*THREE*/', three)
open('penrose.html', 'w').write(out); print(len(out)//1024, 'KB')
