
/**
 * This calculates the Rank Biased Overlap(RBO) for two sorted lists.
 *
 * Based on "A Similarity Measure for Indefinite Rankings" William Webber, Alistair Moffat,
 * and Justin Zobel (Nov 2010).
 *
 * For more information, read
 *  http://www.williamwebber.com/research/papers/wmz10_tois.pdf
 *
 * Based on the reference by Damian Gryski in Golang available from
 *  https://github.com/dgryski
 *
 * @license Licensed under the MIT license.
 *
 * @author Dag Holmberg
 * https://github.com/holmberd
 */

/**
 * Object Constructor creates a new RBO state calculation
 * @constructor
 * @param {number} p - degree (0..1) of top-weightedness of the RBO metric
 */
const RBO = function (p) {
    this.p = p;
    this.rbo = 0;
    this.depth = 0;
    this.overlap = 0;
    this.shortDepth = -1;
    this.seen = new Map();
    this.wgt = (1 - p) / p;
    this.shortOverlap = -1;
    return this;
};

/**
 * Calculates the weight of first d rankings with parameter p
 * @function calcWeight
 * @static
 * @param {number} p - degree (0..1) of top-weightedness of the RBO metric
 * @param {number} d - ranking
 */
RBO.calcWeight = function(p, d) {
    let summa = 0;
    for (let i = 1; i < d; i++) {
        summa += Math.pow(p, i) / i;
    }
    return 1 - Math.pow(p, (d - 1)) + ((1 - p) / p) * d * (Math.log( 1 / (1 - p) ) - summa);
};

/**
 * Calculates similarity RBO
 * @function calculate
 * @param {array} s - sorted ranked list
 * @param {array} t - sorted ranked list
 * @return {function} - extrapolated calculation
 */
RBO.prototype.calculate = function (s, t) {
    if (t.length < s.length){
        let _t = s;
        s = t;
        t = _t;
    }
    for (let i = 0, l = s.length; i < l; i++){
        this.update(s[i], t[i]);
    }
    this.endShort();
    if (t.length > s.length){
        for (let n = s.length, le = t.length; n < le; n++){
            this.updateUneven(t[n]);
        }
    }
    return this.calcExtrapolated();
};

/**
 * Calculates the estimate beyond the original observation range
 * @function calcExtrapolated
 * @return {number} - similarity RBO scores achieved
 */
RBO.prototype.calcExtrapolated = function () {
    let pl = Math.pow(this.p, this.depth);
    if (this.shortDepth == -1) {
        this.endShort();
    }
    return this.rbo + ((this.overlap-this.shortOverlap)/(this.depth)+((this.shortOverlap)/(this.shortDepth)))*pl;
};

/**
 * Adds elements from the two lists to our state calculation
 * @function RBO.prototype.update
 * @param {element} e1
 * @param {element} e2
 */
RBO.prototype.update = function (e1, e2) {
    if (this.shortDepth != -1){
        console.log("RBO: update() called after EndShort()");
        return false;
    }
    if (e1 == e2){
        this.overlap++;
    }
    else {
        if (this.seen.has(e1)){
            this.seen.set(e1, false);
            this.overlap++;
        }
        else {
            this.seen.set(e1, true);
        }

        if(this.seen.has(e2)){
            this.seen.set(e2, false);
            this.overlap++;
        }
        else {
            this.seen.set(e2, true);
        }
    }
    this.depth++;
    this.wgt *= this.p;
    this.rbo += (this.overlap / this.depth) * this.wgt;
};

/**
 * Indicates the end of the shorter of the two lists has been reached
 * @function endShort
 */
RBO.prototype.endShort = function () {
    this.shortDepth = this.depth;
    this.shortOverlap = this.overlap;
};

/**
 * Adds elements from the longer list to the state calculation
 * @function UpdateUneven
 * @param {element}
 */
RBO.prototype.updateUneven = function (e) {
    if (this.shortDepth == -1) {
        console.log("RBO: UpdateUneven() called without EndShort()");
        return false;
    }
    if (this.seen[e]) {
        this.overlap++;
        this.seen[e] = false;
    }
    this.depth++;
    this.wgt *= this.p;
    this.rbo += (this.overlap / this.depth) * this.wgt;
    this.rbo += ((this.shortOverlap*(this.depth-this.shortDepth)) / (this.depth*this.shortDepth)) * this.wgt;
};

const links = {
    "Node": "https://nodejs.org/en/",
    "React": "https://reactjs.org/",
    "Vue": "https://vuejs.org/",
    "CSS": "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference",
    "ES6": "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
};

const rankedLists = {
    "Node": ["Node","ES6"],
    "React": ["React","ES6"],
    "Vue": ["Vue","React","ES6"],
    "CSS": ["CSS"],
    "ES6": ["ES6", "Node"]
};

const rbo = new RBO(0.9);

function getLink(list) {
    return Object.keys(links).map(key => {
        const score = rbo.calculate(list, rankedLists[key]);
        return {
            score,
            key,
            link: links[key]
        }
    }).sort((a,b) => {
        return a.score < b.score;
    });
}

exports.handler = (event, context) => {
    context.succeed(getLink(JSON.parse(event)))
};