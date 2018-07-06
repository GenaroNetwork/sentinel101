import Vue from "vue"

import * as humanSize from 'human-size'
import * as numeral from 'numeral'

Vue.filter("formatSize", size => {
    if (size === null || size === void 0) return "--";
    return humanSize(size, 2);
});

Vue.filter("formatNumber", n => {
    if (n === null || n === void 0) return "--";
    return numeral(n).format('0,0')
});

