const fs = require('fs')

// convenience function to return values in the matrix, defaulting to highest value (10) for points outside the matrix
const EDGE_VALUE = 10

function val_at(a, ncols, col, row) {
    if (col < 0 || col >= ncols || row < 0 || row >= a.length/ncols) {
        return EDGE_VALUE
    }
    return a[row * ncols + col]
}

function find_low (a, ncols) {
    let nrows = a.length/ncols
    let ret = {
        total: 0,
        lows: [],
    }
    let total = 0
    for(let r = 0; r < nrows; r++) {
        for(let c = 0; c < ncols; c++) {
            let v = val_at(a, ncols, c, r)
            if (
                v < val_at(a, ncols, c-1, r) &&
                v < val_at(a, ncols, c+1, r) &&
                v < val_at(a, ncols, c, r-1) &&
                v < val_at(a, ncols, c, r+1)
            ) {
                ret.lows[r * ncols + c] = 1
                ret.total += v + 1
            }
        }
    }
    return ret
}

const log = console.log

function print_css_styles () {
    log('<style>')
    log('    t0 { color: #700; }')
    log('    t1 { color: #900; }')
    log('    t2 { color: #B00; }')
    log('    t3 { color: #D00; }')
    log('    t4 { color: #F00; }')
    log('    t5 { color: #F70; }')
    log('    t6 { color: #F90; }')
    log('    t7 { color: #FB0; }')
    log('    t8 { color: #FD0; }')
    log('    t9 { color: #FF0; }')
    log('    t10 { color: #090; }')
    log('    total { font-size: x-large; }')
    log('</style>')
}

function print_color_map (a, ncols, lows) {
    log('<!DOCTYPE html>')
    print_css_styles()

    let nrows = a.length/ncols
    for(let r = 0; r < nrows; r++) {
        let line = ''
        for(let c = 0; c < ncols; c++) {
            let v = val_at(a, ncols, c, r)
            let tag = lows[r * ncols + c] ? 't10' : `t${v}`
            line += `<${tag}>${v}</${tag}>`
        }
        log(line, '<br>')
    }
}

function parse_vals(lines) {
    let ret = []
    lines.map(line => {
        for (let i=0; i<line.length; i++) {
            ret.push(parseInt((line[i])))
        }
    })
    return ret
}

function err (s) { throw Error(s) }

if (require.main === module) {
    let lines = fs.readFileSync('./data', 'utf8').split('\n')
    let vals = parse_vals(lines)
    let info = find_low(vals, lines[0].length)
    print_color_map(vals, lines[0].length, info.lows)
    log(`<br><br><total>total: ${info.total}</total>`)
}
