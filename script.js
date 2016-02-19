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

	this.textSize = 16;
	this.textFont = "sans-serif"
	this.textOffset = 10;
	this.textWidth = 6;
	this.textColorLeft = "#000";
	this.textColorRight = "#000";

	this.textYan = "";
	this.textYin = "";

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
		var textWidth = yinyang.textWidth * yinyang.textSize;

		ctx.strokeStyle = "#000";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(yinyang.x, yinyang.y, yinyang.radius, 0, dPI);
		ctx.closePath();
		ctx.stroke();

		if (this.focused) {
			ctx.shadowColor = this.shadowColor;
			ctx.shadowBlur = 7;
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

		function parseSentences(text, sentenceWidth) {
			var list = [], sen = "", ch, len = 0, addLen;
			for (var i = 0; i < text.length; i++) {
				ch = text[i];
				if (ch.match(/^[a-zA-Z0-9]$/) || (ch == ' ')) addLen = 0.5;
				else addLen = 1;
				if (len + addLen > sentenceWidth) {
					list.push(sen);
					sen = "";
					len = 0;
				}
				len += addLen;
				sen += ch;
			}
			if (len > 0) list.push(sen);
			return list;
		}
		function sentenceWidth(sentence) {
			var len = 0;
			if (sentence) {
				for (var i = 0; i < sentence.length; i++) {
					ch = sentence[i];
					if (ch.match(/^[a-zA-Z0-9]$/) || (ch == ' ')) len += 0.5;
					else len += 1;
				}
			}
			return len;
		}
		var textYan = "", textYin = "";
		var sentencesYan = parseSentences(yinyang.textYan, yinyang.textWidth), sentencesYin = parseSentences(yinyang.textYin, yinyang.textWidth);
		var sentenceWidthYan = ((sentencesYan.length > 1) ? yinyang.textWidth : sentenceWidth(sentencesYan[0])), sentenceWidthYin = ((sentencesYin.length > 1) ? yinyang.textWidth : sentenceWidth(sentencesYin[0]));

		ctx.font = yinyang.textSize + "px " + yinyang.textFont;
		ctx.fillStyle = yinyang.textColorLeft;
		for (var i = 0; i < sentencesYan.length; i++) ctx.fillText(sentencesYan[i], yinyang.x - yinyang.radius - yinyang.textOffset - sentenceWidthYan * yinyang.textSize, yinyang.y + sentencesYan.length * yinyang.textSize / 2 - (sentencesYan.length - i - 1) * yinyang.textSize, sentenceWidthYan * yinyang.textSize);
		ctx.fillStyle = yinyang.textColorRight;
		for (var i = 0; i < sentencesYin.length; i++) ctx.fillText(sentencesYin[i], yinyang.x + yinyang.radius + yinyang.textOffset,                                       yinyang.y + sentencesYin.length * yinyang.textSize / 2 - (sentencesYin.length - i - 1) * yinyang.textSize, sentenceWidthYin * yinyang.textSize);
	};

	this.inRange = function(x, y) {
		x = x - this.x;
		y = y - this.y;
		return (x * x + y * y < this.radius * this.radius);
	};
}

function initialize(list) {
	var canvasSize = canvasWidth > canvasHeight ? canvasHeight : canvasWidth;
	var centerX = canvasWidth * 0.5, centerY = canvasHeight * 0.5;
	// var mainRadius = canvasSize * 0.34, secondRadius = canvasSize * 0.1;
	var mainRadius = 170, secondRadius = 50;
	list.push(new Yinyang(centerX, centerY, mainRadius));
	list[0].unFocusable = true;
	list.push(new Yinyang(centerX + mainRadius, centerY, secondRadius));
	list[1].textWidth = 2.5;
	list[1].textColorLeft = "#fff";
	list.push(new Yinyang(centerX, centerY + mainRadius, secondRadius));
	list[2].textWidth = 8.5;
	list.push(new Yinyang(centerX - mainRadius, centerY, secondRadius));
	list[3].textWidth = 2.5;
	list.push(new Yinyang(centerX, centerY - mainRadius, secondRadius));
	list[4].textWidth = 8.5;
}

function loadCurrentItem(item) {
	if (item) {
		$('#input-yang').val(item.textYan);
		$('#input-yin').val(item.textYin);
		$('#current-panel').show();
	} else {
		$('#input-yang').val("");
		$('#input-yin').val("");
		$('#current-panel').hide();
	}
}

function refresh(ctx, list) {
	ctx.clearRect(0,0,canvasWidth,canvasHeight);
	for (var i = 0; i < list.length; i++) {
		list[i].drawOnCanvas(ctx);
	}
}

function refreshInfoRegion(ctx, name, date) {
	var infoSentenceWidth = 100, infoSentenceHeight = 20, infoTextColor = "#000", infoTextSize = 16;
	ctx.clearRect(canvasWidth - infoSentenceWidth, canvasHeight - infoSentenceHeight * 3, infoSentenceWidth, infoSentenceHeight * 2);
	ctx.fillStyle = infoTextColor;
	ctx.fillText(name, canvasWidth - infoSentenceWidth, canvasHeight - infoSentenceHeight * 2 - (infoSentenceHeight - infoTextSize) / 2, infoSentenceWidth);
	ctx.fillText(date, canvasWidth - infoSentenceWidth, canvasHeight - infoSentenceHeight - (infoSentenceHeight - infoTextSize) / 2, infoSentenceWidth);
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
	ml = yinyangList;
	var focusedItem = null;
	var activeItem = null;
	var mousePressed = false;
	var mousePressX, mousePressY;
	var mousePressActiveRate;
	var mousePressMoved = false;

	var mainCanvas = document.getElementById('main-canvas');
	var $mainCanvas = $(mainCanvas);
	mainCanvas.width = canvasWidth = $mainCanvas.width();
	mainCanvas.height = canvasHeight = $mainCanvas.height();
	var mainCtx = mainCanvas.getContext("2d");

	function doRefresh() {
		refresh(mainCtx, yinyangList);
		refreshInfoRegion(mainCtx, $('#input-name').val(), $('#input-date').val());
	}

	$('.input-box').change(function() {
		if ($(this).is("#input-yang")) {
			if (activeItem) activeItem.textYan = $(this).val();
		} else if ($(this).is("#input-yin")) {
			if (activeItem) activeItem.textYin = $(this).val();
		} else if ($(this).is("#input-name") || $(this).is("#input-date")) {
			
		}
		doRefresh();
	});

	$('.main-canvas').mousedown(function(event) {
		if (focusedItem) {
			mousePressed = true;
			mousePressX = event.offsetX;
			mousePressY = event.offsetY;
			mousePressActiveRate = focusedItem.rate;
			mousePressMoved = false;
		}
		if (focusedItem != activeItem) {
			if (activeItem) activeItem.focused = false;
			activeItem = false;
			loadCurrentItem(activeItem);
			doRefresh();
		}
	});
	$('.main-canvas').mouseup(function(event) {
		if (mousePressed) {
			mousePressed = false;
			if (!mousePressMoved) {
				if (activeItem) activeItem.focused = false;
				activeItem = focusedItem;
				activeItem.focused = true;
				loadCurrentItem(activeItem);
			}
			doRefresh();
		}
	});
	$('.main-canvas').mousemove(function(event) {
		var x = event.offsetX, y = event.offsetY;
		if (mousePressed) {
			var rate = parseFloat(y - mousePressY) / focusedItem.radius + mousePressActiveRate;
			if (rate < 0) rate = 0;
			if (rate > 1) rate = 1;
			focusedItem.rate = rate;
			doRefresh();
		} else {
			var focused = false, statusChanged = false, item = null;
			focusedItem = null;
			for (var i = yinyangList.length - 1; i >= 0; i--) {
				item = yinyangList[i];
				if ((!item.unFocusable) && item.inRange(x, y)) {
					if (!item.focused) {
						statusChanged = true;
					}
					if (!focused) {
						item.focused = true;
						focusedItem = item;
					} else {
						item.focused = false;
					}
					focused = true;
				} else {
					if (item.focused) {
						statusChanged = true;
					}
					if (item != activeItem) item.focused = false;
				}
			}
			if (statusChanged) doRefresh();
		}
	});

	$('#save-button').click(function() {
		for (var i = yinyangList.length - 1; i >= 0; i--) {
			yinyangList[i].focused = false;
		}
		doRefresh();
		saveFile(mainCanvas.toDataURL('image/png'), '阴阳图.png');
	});
	$('#clear-button').click(function() {
		for (var i = yinyangList.length - 1; i >= 0; i--) {
			yinyangList[i].rate = 0.5;
		}
		doRefresh();
	});

	var today = new Date();
	$('#input-date').val(today.getUTCFullYear() + "-" + (today.getUTCMonth() + 1) + "-" + (today.getUTCDate() + 1));
	initialize(yinyangList);
	doRefresh();
});






