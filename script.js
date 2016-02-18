PI = Math.PI;
HPI = PI / 2;
dHPI = 2 * HPI;
tHPI = 3 * HPI;
qHPI = 4 * HPI;
dPI = 2 * PI;

var canvasWidth = 0;
var canvasHeight = 0;

Array.prototype.push_head = function(item) {
	this.splice(0,0,item);
}

function Yinyang(x, y, radius, rate) {
	this.x = x || 0;
	this.y = y || 0;
	this.radius = radius || 0;
	this.rate = rate || 0.5; // for yang
	this.eyeRate = 0.2;
	this.colorYin = "#000";
	this.colorYan = "#fff";
	this.shadowColor = "#6666ff";

	this.focused = false;
	this.unFocusable = false;

	this.radiusYin = function() { return (1 - this.rate) * this.radius; };
	this.radiusYan = function() { return this.rate * this.radius; };

	this.toJson = function() {
		return {
			x: this.x,
			y: this.y,
			radius: this.radius,
			rate: this.rate,
			eyeRate: this.eyeRate,
			colorYin: this.colorYin
		};
	};

	this.loadJson = function(json_obj) {
		this.x = json_obj.x;
		this.y = json_obj.y;
		this.radius = json_obj.radius;
		this.rate = json_obj.rate;
		this.eyeRate = json_obj.eyeRate;
		this.colorYin = json_obj.colorYin;
	};

	this.drawOnCanvas = function(ctx) {
		var yinyang = this;
		var radiusYan = yinyang.radiusYan();
		var radiusYin = yinyang.radiusYin();

		if (this.focused) {
			ctx.shadowColor = this.shadowColor;
			ctx.shadowBlur = 5;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.strokeStyle = this.shadowColor;
			ctx.lineWidth = 0;
			ctx.beginPath();
			ctx.arc(yinyang.x, yinyang.y, yinyang.radius, 0, dPI);
			ctx.closePath();
			ctx.stroke();
			ctx.shadowBlur = 0;
		}

		ctx.fillStyle = yinyang.colorYan;
		ctx.beginPath();
		ctx.arc(yinyang.x, yinyang.y, yinyang.radius, HPI, tHPI);
		ctx.arc(yinyang.x, yinyang.y - yinyang.radius + radiusYan, radiusYan, -HPI, HPI);
		ctx.arc(yinyang.x, yinyang.y + yinyang.radius - radiusYin, radiusYin, tHPI, HPI, true);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = yinyang.colorYin;
		ctx.beginPath();
		ctx.arc(yinyang.x, yinyang.y - yinyang.radius + radiusYan, radiusYan * yinyang.eyeRate, 0, dPI);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = yinyang.colorYin;
		ctx.beginPath();
		ctx.arc(yinyang.x, yinyang.y, yinyang.radius, -HPI, HPI);
		ctx.arc(yinyang.x, yinyang.y + yinyang.radius - radiusYin, radiusYin, HPI, tHPI);
		ctx.arc(yinyang.x, yinyang.y - yinyang.radius + radiusYan, radiusYan, HPI, -HPI, true);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = yinyang.colorYan;
		ctx.beginPath();
		ctx.arc(yinyang.x, yinyang.y + yinyang.radius - radiusYin, radiusYin * yinyang.eyeRate, 0, dPI);
		ctx.closePath();
		ctx.fill();
	};

	this.inRange = function(x, y) {
		x = x - this.x;
		y = y - this.y;
		return (x * x + y * y < this.radius * this.radius);
	};
}

function initialize(list) {
	var canvasSize = canvasWidth > canvasHeight ? canvasHeight : canvasWidth;
	var centerX = canvasWidth * 0.5, centerY = canvasHeight * 0.5, mainRadius = canvasSize * 0.34, secondRadius = canvasSize * 0.1;
	list.push(new Yinyang(centerX, centerY, mainRadius));
	list[0].unFocusable = true;
	list.push(new Yinyang(centerX + mainRadius, centerY, secondRadius));
	list.push(new Yinyang(centerX, centerY + mainRadius, secondRadius));
	list.push(new Yinyang(centerX - mainRadius, centerY, secondRadius));
	list.push(new Yinyang(centerX, centerY - mainRadius, secondRadius));
}

function refresh(ctx, list) {
	ctx.clearRect(0,0,canvasWidth,canvasHeight);
	for (var i = 0; i < list.length; i++) {
		list[i].drawOnCanvas(ctx);
	}
}

var saveFile = function(data, filename){
    var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    save_link.href = data;
    save_link.download = filename;
   
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(event);
};

$(document).ready(function() {
	var yinyangList = [];
	var activeItem = null;
	var mousePressed = false;
	var mousePressX, mousePressY;
	var mousePressActiveRate;

	var mainCanvas = document.getElementById('main-canvas');
	var $mainCanvas = $(mainCanvas);
	mainCanvas.width = canvasWidth = $mainCanvas.width();
	mainCanvas.height = canvasHeight = $mainCanvas.height();
	var mainCtx = mainCanvas.getContext("2d");

	$('.main-canvas').mousedown(function(event) {
		if (activeItem) {
			mousePressed = true;
			mousePressX = event.offsetX;
			mousePressY = event.offsetY;
			mousePressActiveRate = activeItem.rate;
		}
	});
	$('.main-canvas').mouseup(function(event) {
		if (mousePressed) {
			mousePressed = false;
		}
	});
	$('.main-canvas').mousemove(function(event) {
		var x = event.offsetX, y = event.offsetY;
		if (mousePressed) {
			var rate = parseFloat(y - mousePressY) / activeItem.radius + mousePressActiveRate;
			if (rate < 0) rate = 0;
			if (rate > 1) rate = 1;
			activeItem.rate = rate;
			refresh(mainCtx, yinyangList);
		} else {
			var focused = false, statusChanged = false, item = null;
			activeItem = null;
			for (var i = yinyangList.length - 1; i >= 0; i--) {
				item = yinyangList[i];
				if ((!item.unFocusable) && item.inRange(x, y)) {
					if (!item.focused) {
						statusChanged = true;
					}
					if (!focused) {
						item.focused = true;
						activeItem = item;
					} else {
						item.focused = false;
					}
					focused = true;
				} else {
					if (item.focused) {
						statusChanged = true;
					}
					item.focused = false;
				}
			}
			if (statusChanged) refresh(mainCtx, yinyangList);
		}
	});

	$('#save-button').click(function() {
		for (var i = yinyangList.length - 1; i >= 0; i--) {
			yinyangList[i].focused = false;
		}
		refresh(mainCtx, yinyangList);
		saveFile(mainCanvas.toDataURL('image/png'), '阴阳图.png');
	});

	initialize(yinyangList);
	refresh(mainCtx, yinyangList);
});






