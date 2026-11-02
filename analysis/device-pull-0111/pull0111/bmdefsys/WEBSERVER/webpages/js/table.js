var TINY = {};

function getElement(i) {
	return document.getElementById(i)
}

function getTblElements(e, p) {
	return p.getElementsByTagName(e)
}

/* n = function , t = table, p = data object */

TINY.table = function() {

	function sorter(sorterFn, tableId, dataObject) {
		this.sorterFn = sorterFn;
		this.id = tableId;
		this.dataObject = dataObject;
		if (this.dataObject.init) {
			this.init()
		}
	}

	sorter.prototype.init = function() {
		this.set();
		var tableObj = this.tableObj, i = d = 0;
		tableObj.headerRow = getTblElements('tr',tableObj)[0];
		tableObj.recordCount = tableObj.tableRows.length;
		/* no of records */
		tableObj.columnCnt = tableObj.tableRows[0].cells.length;

		tableObj.rowArray = [];
		tableObj.columnArray = [];
		this.dataObject.is = this.dataObject.size;
		if (this.dataObject.colddid) {
			d = getElement(this.dataObject.colddid);
			var o = document.createElement('option');
			o.value = -1;
			o.innerHTML = 'All Columns';
			d.appendChild(o)
		}
		for (i; i < tableObj.columnCnt; i++) {
			var c = tableObj.headerRow.cells[i];
			tableObj.columnArray[i] = {};
			if (c.className != 'nosort') {
				c.className = this.dataObject.headclass;
				c.onclick = new Function(this.sorterFn + '.sort(' + i + ')');
				c.onmousedown = function() {
					return false
				};
			}
			if (this.dataObject.columns) {
				var l = this.dataObject.columns.length, x = 0;
				for (x; x < l; x++) {
					if (this.dataObject.columns[x].index == i) {
						var g = this.dataObject.columns[x];
						tableObj.columnArray[i].format = g.format == null ? 1 : g.format;
						tableObj.columnArray[i].decimals = g.decimals == null ? 2 : g.decimals
					}
				}
			}
			if (d) {
				var o = document.createElement('option');
				o.value = i;
				o.innerHTML = getTblElements('h6',c)[0].innerHTML;
				d.appendChild(o)
			}
		}
		this.reset()
	};
	sorter.prototype.reset = function() {
		var tableObj = this.tableObj;
		tableObj.totalPages = tableObj.recordCount;
		for (var i = 0; i < tableObj.recordCount; i++) {
			tableObj.rowArray[i] = {};
			tableObj.rowArray[i].s = 1
		}
		if (this.dataObject.sortcolumn != undefined) {
			this.sort(this.dataObject.sortcolumn, 1, this.dataObject.is)
		} else {
			if (this.dataObject.paginate) {
				this.size()
			}
			this.alt();
			this.sethover()
		}

	};
	sorter.prototype.sort = function(x, f, z) {
		var t = this.tableObj;
		t.y = x;
		var x = t.headerRow.cells[t.y], i = 0, n = document.createElement('tbody');
		for (i; i < t.recordCount; i++) {
			t.rowArray[i].o = i;
			var v = t.tableRows[i].cells[t.y];
			t.tableRows[i].style.display = '';
			while (v.hasChildNodes()) {
				v = v.firstChild
			}
			t.rowArray[i].v = v.nodeValue ? v.nodeValue : ''
		}
		for ( i = 0; i < t.columnCnt; i++) {
			var c = t.headerRow.cells[i];
			if (c.className != 'nosort') {
				c.className = this.dataObject.headclass
			}
		}
		if (t.p == t.y && !f) {
			t.rowArray.reverse();
			x.className = t.d ? this.dataObject.ascclass : this.dataObject.descclass;
			t.d = t.d ? 0 : 1
		} else {
			t.p = t.y;
			f && this.dataObject.sortdir == -1 ? t.rowArray.sort(cp).reverse() : t.rowArray.sort(cp);
			t.d = 0;
			x.className = this.dataObject.ascclass
		}
		for ( i = 0; i < t.recordCount; i++) {
			var r = t.tableRows[t.rowArray[i].o].cloneNode(true);
			n.appendChild(r)
		}
		t.replaceChild(n, t.b);
		this.set();
		this.alt();
		if (this.dataObject.paginate) {
			this.size(z)
		}
		this.sethover()
	};
	sorter.prototype.sethover = function() {
		if (this.dataObject.hoverid) {
			for (var i = 0; i < this.tableObj.recordCount; i++) {
				var r = this.tableObj.tableRows[i];
				r.setAttribute('onmouseover', this.sorterFn + '.hover(' + i + ',1)');
				r.setAttribute('onmouseout', this.sorterFn + '.hover(' + i + ',0)')
			}
		}
	};

	sorter.prototype.alt = function() {
		var t = this.tableObj, i = x = 0;
		for (i; i < t.recordCount; i++) {
			var r = t.tableRows[i];
			if (t.rowArray[i].s) {
				r.className = x % 2 == 0 ? this.dataObject.evenclass : this.dataObject.oddclass;
				var cells = getTblElements('td', r);
				for (var z = 0; z < t.columnCnt; z++) {
					cells[z].className = t.y == z ? x % 2 == 0 ? this.dataObject.evenselclass : this.dataObject.oddselclass : ''
				}
				x++
			}
			if (!t.rowArray[i].s) {
				r.style.display = 'none'
			}
		}
	};
	sorter.prototype.page = function(s) {
		var t = this.tableObj, i = x = 0, l = s + parseInt(this.dataObject.size);
		if (this.dataObject.totalrecid) {
			getElement(this.dataObject.totalrecid).innerHTML = t.totalPages
		}
		if (this.dataObject.currentid) {
			getElement(this.dataObject.currentid).innerHTML = this.presentPageNo
		}
		if (this.dataObject.startingrecid) {
			var b = ((this.presentPageNo - 1) * this.dataObject.size) + 1, m = b + (this.dataObject.size - 1);
			m = m < t.recordCount ? m : t.totalPages;
			m = m < t.totalPages ? m : t.totalPages;
			getElement(this.dataObject.startingrecid).innerHTML = t.totalPages == 0 ? 0 : b;
			;
			getElement(this.dataObject.endingrecid).innerHTML = m
		}
		for (i; i < t.recordCount; i++) {
			var r = t.tableRows[i];
			if (t.rowArray[i].s) {
				r.style.display = x >= s && x < l ? '' : 'none';
				x++
			} else {
				r.style.display = 'none'
			}
		}
	};

	sorter.prototype.move = function(pageCount, m) {
		this.goto(pageCount == 1 ? ( m ? this.pageCount : this.presentPageNo + 1) : ( m ? 1 : this.presentPageNo - 1))
	};

	sorter.prototype.goto = function(s) {
		if (s <= this.pageCount && s > 0) {
			this.presentPageNo = s;
			this.page((s - 1) * this.dataObject.size)
		}
	};

	sorter.prototype.size = function(s) {


        if (s == "All") {           
            return this.showall();           
        }
		var t = this.tableObj;       
		if (s) {
			this.dataObject.size = s
		}
		this.presentPageNo = 1;
		this.pageCount = Math.ceil(this.tableObj.totalPages / this.dataObject.size);
		if (this.dataObject.navid) {
			getElement(this.dataObject.navid).style.display = this.pageCount < 2 ? 'none' : 'block';
		}
		this.page(0);
		if (this.dataObject.totalid) {
			getElement(this.dataObject.totalid).innerHTML = t.totalPages == 0 ? 1 : this.pageCount;
		}
		if (this.dataObject.pageddid) {
			var d = getElement(this.dataObject.pageddid), l = this.pageCount + 1;
			d.setAttribute('onchange', this.sorterFn + '.goto(this.value)');
			while (d.hasChildNodes()) {
				d.removeChild(d.firstChild)
			}
			for (var i = 1; i <= this.pageCount; i++) {
				var o = document.createElement('option');
				o.value = i;
				o.innerHTML = i;
				d.appendChild(o)
			}
		}
	};

	sorter.prototype.showall = function() {
		this.size(this.tableObj.totalPages)
	};

	sorter.prototype.search = function(f) {
		var i = x = n = 0, k = -1, q = getElement(f).value.toLowerCase();
		if (this.dataObject.colddid) {
			k = getElement(this.dataObject.colddid).value;
		}
		var s = (k == -1) ? 0 : k, e = (k == -1) ? this.tableObj.columnCnt : parseInt(s) + 1;
		for (i; i < this.tableObj.recordCount; i++) {
			var r = this.tableObj.tableRows[i], v;
			if (q == '') {
				v = 1
			} else {
				for ( x = s; x < e; x++) {
					var b = r.cells[x].innerHTML.toLowerCase();
					if (b.indexOf(q) == -1) {
						v = 0
					} else {
						v = 1;
						break
					}
				}
			}
			if (v) {
				n++
			}
			this.tableObj.rowArray[i].s = v
		}
		this.tableObj.totalPages = n;
		if (this.dataObject.paginate) {
			this.size();
		}
		this.alt();
	};

	sorter.prototype.hover = function(mouseOverRowNo, d) {
		this.tableObj.tableRows[mouseOverRowNo].id = d ? this.dataObject.hoverid : '';
	};

	sorter.prototype.set = function() {
		var tableObj = getElement(this.id);
		tableObj.b = getTblElements('tbody',tableObj)[0];
		tableObj.tableRows = tableObj.b.rows;

		this.tableObj = tableObj;
	};
	Array.prototype.exists = function(v) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] == v) {
				return 1;
			}
		}
		return 0
	};

	function cp(f, c) {
		var g, h;
		f = g = f.v.toLowerCase();
		c = h = c.v.toLowerCase();
		var i = parseFloat(f.replace(/(\$|\,)/g, '')), n = parseFloat(c.replace(/(\$|\,)/g, ''));
		if (!isNaN(i) && !isNaN(n)) {
			g = i, h = n
		}
		i = Date.parse(f);
		n = Date.parse(c);
		if (!isNaN(i) && !isNaN(n)) {
			g = i;
			h = n
		}
		return g > h ? 1 : (g < h ? -1 : 0)
	};
	return {
		sorter : sorter
	}
}();

var sorter, sorter1, sorter2, sorter3;

function datatable(tableId) {
	sorter = new TINY.table.sorter("sorter", tableId, {
		headclass : 'head',
		ascclass : 'asc',
		descclass : 'desc',
		evenclass : 'evenrow',
		oddclass : 'oddrow',
		evenselclass : 'evenselected',
		oddselclass : 'oddselected',
		paginate : true,
		size : 10,
		colddid : 'columns',
		currentid : 'currentpage',
		totalid : 'totalpages',
		startingrecid : 'startrecord',
		endingrecid : 'endrecord',
		totalrecid : 'totalrecords',
		hoverid : 'selectedrow',
		pageddid : '',
		navid : 'tablenav',
		sortcolumn : 0,
		sortdir : 1,
		init : true
	});
}
