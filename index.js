const fs = require('fs')

// convenience function to return values in the matrix, defaulting to highest value (10) for points outside the matrix

function padl (s, l, c) { c = c || ' '; while (s.length < l) s = c + s; return s }

function val_at(a, ncols, col, row, default_val = 10) {
    if (col < 0 || col >= ncols || row < 0 || row >= a.length/ncols) {
        return default_val
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
    log('    html { font-family: monospace; }')
    log('    t0 { color: #500; }')
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

function print_color_map (a, ncols, lows, binary=false) {
    log('<!DOCTYPE html>')
    print_css_styles()

    let nrows = a.length/ncols
    for(let r = 0; r < nrows; r++) {
        let line = ''
        for(let c = 0; c < ncols; c++) {
            let v = val_at(a, ncols, c, r)
            let tag = ((binary && v !== 1) || lows[r * ncols + c]) ? 't10' : `t${v}`
            line += `<${tag}>&nbsp;${padl(String(v),3,'0')}</${tag}>`
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

function parse_basins(lines) {
    let ret = []
    lines.map(line => {
        for (let i=0; i<line.length; i++) {
            ret.push((line[i] === '9') ? 1 : 0)
        }
    })
    return ret
}

function part_one () {
    let lines = fs.readFileSync('./data', 'utf8').split('\n')
    let vals = parse_vals(lines)
    let info = find_low(vals, lines[0].length)
    print_color_map(vals, lines[0].length, info.lows)
    log(`<br><br><total>total: ${info.total}</total>`)
}

function fill_basins(a, ncols) {
    let nrows = a.length/ncols
    let basin_id = 2
    let ret = {
        remap: [],
    }
    for (let r = 0; r < nrows; r++) {
        for (let c = 0; c < ncols; c++) {
            let v = val_at(a, ncols, c, r)
            if (v === 0) {
                let up = val_at(a, ncols, c, r - 1, 1)
                let left = val_at(a, ncols, c-1, r, 1)
                if (up > 1 && left > 1) {
                    if (left === up) {
                        v = up
                    } else {
                        let min = Math.min(left, up)
                        let max = Math.max(left, up)
                        let prev = ret.remap[max]
                        if (prev && prev !== min) {
                            // reset previous to map to the new minimum (merge all to min value)
                            min = Math.min(min, prev)
                            if (prev !== min) {
                                ret.remap[prev] = min
                            }
                        }
                        ret.remap[max] = min
                        v = min
                    }
                } else if (up > 1 && left === 1) {
                    v = up
                } else if (left > 1 && up === 1) {
                    v = left
                } else {
                    v = basin_id++
                }
                a[r * ncols + c] = v
            }
        }
    }
    return ret
}

function remap_basins (a, ncols, remap) {
    let nrows = a.length / ncols
    for (let r = 0; r < nrows; r++) {
        for (let c = 0; c < ncols; c++) {
            let v = val_at(a, ncols, c, r)
            while (remap[v]) {
                v = remap[v]
            }
            a[r * ncols + c] = v
        }
    }
}

function measure_basins (a, ncols) {
    let nrows = a.length / ncols
    let counts_by_basin_id = []
    for (let r = 0; r < nrows; r++) {
        for (let c = 0; c < ncols; c++) {
            let v = val_at(a, ncols, c, r)
            if (v !== 1) {
                counts_by_basin_id[v] = (counts_by_basin_id[v] || 0) + 1
            }
        }
    }

    return counts_by_basin_id.reduce((a, count, i) => {
        if (count != null && i !== 1) {
            a.push({id: i, count: count})
        }
        return a
    }, [])
}

function check_basins (a, ncols) {
    let nrows = a.length / ncols
    for (let r = 0; r < nrows; r++) {
        for (let c = 0; c < ncols; c++) {
            let v = val_at(a, ncols, c, r);
            if (v !== 1) {
                [[c-1,r],[c+1,r],[c,r-1],[c,r+1]].forEach(pos => {
                    let neighbor = val_at(a, ncols, pos[0], pos[1], 1)
                    if (neighbor !== 1 && neighbor !== v) {
                        console.log(`oops:' ${JSON.stringify(pos)}`)
                    }
                })
            }
        }
    }
}

function part_two () {
    let lines = fs.readFileSync('./data', 'utf8').split('\n')
    let ncols = lines[0].length
    let vals = parse_basins(lines)
    let info = fill_basins(vals, ncols)
    remap_basins(vals, ncols, info.remap)
    check_basins(vals, ncols)
    print_color_map(vals, lines[0].length, [], true)
    let counts = measure_basins(vals, ncols).sort((a,b) => a.count - b.count)
    let biggest = counts.slice(-3)
    log(`<br><br><total>biggest basins: ${JSON.stringify(biggest)}</total>`)
    log(`<br><br><total>a*b*c: ${biggest.reduce((sum, rec)=> sum * rec.count, 1)}</total>`)
}

if (require.main === module) {
    // part_one()
    part_two()
}
