# Builds republic.html (one self-contained file) from republic.src.html + three.js r170.
# Get the library:  npm pack three@0.170.0 && mkdir t3 && tar xzf three-0.170.0.tgz -C t3 --strip-components=1
src = open('t3/build/three.module.min.js').read()
i = src.rindex('export{'); body = src[:i]; exp = src[i+7:src.rindex('}')]
pairs = []
for p in exp.split(','):
    p = p.strip(); a, b = (p.split(' as ') if ' as ' in p else (p, p))
    pairs.append(f'{b.strip()}:{a.strip()}')
three = 'var THREE=(function(){"use strict";\n' + body + '\nreturn {' + ','.join(pairs) + '};})();'  # plain script, no module/blob import
assert '</script' not in three
out = open('republic.src.html').read().replace('/*THREE*/', three)
open('republic.html', 'w').write(out); print(len(out)//1024, 'KB')
