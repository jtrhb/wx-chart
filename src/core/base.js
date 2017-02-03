/* global module, wx, window: false, document: false */
'use strict';

import { checkWX, is, wxConverToPx, uid, retinaScale, extend } from '../util/helper';
import WxCanvas from '../util/wxCanvas';

// Chart default config
let wxChartDefaultConfig = {
    'fontSize': 10,
    'width': 300,
    'height': 200,
    'display': 'block',
    'padding': 0
};

// Store all references of 'WxChart' instances - allowing us to globally resize chart instances on window resize.
export let wxChartInstances = {};
// The basic class of WeiXin chart
export default class WxChart {
    /**
     * @constructor
     * @param {String} id - Canvas id ,DOM ID or HTMLElement
     * @param {Object|Number} [config] - The config of Canvas or the width of chart.
     * @param {Number} [height] - The height of chart.
     * @param {String} [display] - The display style of chart.
     */
    constructor(id, config) {
        let me = this;

        // Arguments parse...
        let chartConf;
        if (is.Object(config)) {
            chartConf = extend({}, wxChartDefaultConfig, config);
        } else if (is.Number(config) || is.String(config)) {
            // WxChart(id, width, height, display, ...options)
            chartConf = {
                'width': arguments[1],
                'height': 2 in arguments ? arguments[2] : wxChartDefaultConfig.height,
                'display': 3 in arguments ? arguments[3] : wxChartDefaultConfig.display
            };
            if (4 in arguments && is.Object(arguments[4])) {
                extend({}, wxChartDefaultConfig, chartConf, arguments[4]);
            } else {
                extend({}, wxChartDefaultConfig, chartConf);
            }
        }

        me.canvas = new WxCanvas(id, chartConf);
        me.ctx = me.canvas.getContext('2d');
        me.isWeiXinAPP = checkWX();
        me.id = uid();

        me._config = me.initConfig(chartConf);
        me.initContext();

        // Append to wxChartInstances
        wxChartInstances[me.id+''] = me;

        return me;
    }

    initConfig(config) {
        let me = this;
        if (!me.canvas) {
	        console.error("Failed to create WxChart: can't acquire context!");
        }

        let canvas = me.canvas,
            cvWidth = canvas.width,
            cvHeight = canvas.height;
	    config.aspectRatio = config.aspectRatio ?
		    config.aspectRatio :
		    !is.Undefined(cvHeight) && !is.Undefined(cvWidth) ?
                (cvWidth / cvWidth).toFixed(2) : null;
	    config.display = config.display || 'block';
	    return config;
    }

    initContext() {
        let me = this;
        if (!me.canvas) {
             console.error("Failed to create WxChart: can't acquire context!");
            return me;
        }
        // Set scale of canvas
        retinaScale(me.ctx, me.canvas.width, me.canvas.height);

        // Set font size
        if (me.config.fontSize) {
            me.ctx.fontSize = me.config.fontSize;
        }

        // calculate box
        let padding = me.config.padding||0;
        me.innerBox = {
            x: 0 + padding,
            y: 0 + padding,
            width: me.canvas.width - padding*2,
            height: me.canvas.height - padding*2,
            lx: me.canvas.width - padding,
            ly: me.canvas.height - padding,
        };
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    destroy() {
        let me = this;

        me.clear();
        me.canvas.releaseContext();

        if (me.id && me.id in wxChartInstances) {
            delete wxChartInstances[me.id];
        }

        me.id = null;
        me.canvas = null;
        me.ctx = null;
        me._config = null;
        me.innerBox = null;
    }
    // The 'config' property
    get config() {
        if (!this._config) {
	        this._config = extend({}, wxChartDefaultConfig);
        }
        return this._config;
    }
    set config(chartConf) {
        let me = this;
        // Update chart config
        me.initConfig(chartConf);
        me.initContext();
        // Clear canvas
        me.clear();
        // Call redraw
        me.draw();
    }

    draw() {
        // Do nothing...
    }
}