# Rebuilds scroll-vs-codex.html from shell.html + app.js + three.js r170.
# Get the library:  git clone --depth 1 --filter=blob:none --sparse --branch r170 https://github.com/mrdoob/three.js.git t3 && (cd t3 && git sparse-checkout set build)
src = open('t3/build/three.module.min.js').read()
i = src.rindex('export{'); body = src[:i]; exp = src[i+7:src.rindex('}')]
pairs = []
for p in exp.split(','):
    p = p.strip(); a, b = (p.split(' as ') if ' as ' in p else (p, p))
    pairs.append(f'{b.strip()}:{a.strip()}')
three = 'var THREE=(function(){"use strict";\n' + body + '\nreturn {' + ','.join(pairs) + '};})();'  # plain script, no module/blob import
app = open('app.js').read().replace('export function start', 'function start')
assert '</script' not in three and '</script' not in app
out = open('shell.html').read().replace('/*THREE*/', three).replace('/*APP*/', app)
open('scroll-vs-codex.html', 'w').write(out); print(len(out)//1024, 'KB')
