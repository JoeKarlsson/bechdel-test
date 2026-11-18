"""Build digits-only Fraunces faces with equal-width (tabular) figures.
Fraunces ships no tnum feature, so number columns can't line up with it.

    uvx --from fonttools --with brotli python scripts/make-tabular-figures.py \\
        'Fraunces[SOFT,WONK,opsz,wght].ttf' public/fonts

The TTF is google/fonts ofl/fraunces on GitHub."""
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

src, out_dir = sys.argv[1], sys.argv[2]
DIGITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
for wght in (400, 700):
    f = instancer.instantiateVariableFont(TTFont(src), {'opsz': 19, 'wght': wght, 'SOFT': 0, 'WONK': 0})
    opts = subset.Options()
    opts.layout_features = []
    opts.name_IDs = ['*']
    s = subset.Subsetter(opts)
    s.populate(unicodes=range(0x30, 0x3A))
    s.subset(f)
    hm, glyf = f['hmtx'], f['glyf']
    width = max(hm[d][0] for d in DIGITS)
    for d in DIGITS:
        adv, lsb = hm[d]
        shift = (width - adv) // 2
        g = glyf[d]
        if g.numberOfContours:
            g.coordinates.translate((shift, 0))
            g.recalcBounds(glyf)
        hm[d] = (width, lsb + shift)
    for rec in f['name'].names:
        if rec.nameID in (1, 3, 4, 6, 16):
            rec.string = str(rec.toUnicode()).replace('Fraunces', 'Fraunces Figures')
    f.flavor = 'woff2'
    f.save(f'{out_dir}/fraunces-figures-{wght}.woff2')
    print(wght, width)
