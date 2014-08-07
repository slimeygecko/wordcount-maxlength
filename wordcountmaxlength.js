/**
 * wordcountmaxlength.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 *
 * Modified by @slimeygecko - Mike Woodward
 */

/*global tinymce:true */

tinymce.PluginManager.add('wordcountmaxlength', function(editor) {
	var self = this, countre, cleanre;

	// Included most unicode blocks see: http://en.wikipedia.org/wiki/Unicode_block
	// Latin-1_Supplement letters, a-z, u2019 == &rsquo;
	countre = editor.getParam('wordcount_countregex', /[\w\u2019\x27\-\u00C0-\u1FFF]+/g);
	cleanre = editor.getParam('wordcount_cleanregex', /[0-9.(),;:!?%#$?\x27\x22_+=\\\/\-]*/g);

	function update() {
		var wc = editor.theme.panel.find('#wordcount'),
			// maximum character length set by data-max-length on textarea
			charLimit = editor.getElement().dataset.maxLength;

		if (charLimit != 'undefined' && self.getCharCount() > charLimit) {
			wc.text(['Max limit reached!']);
			// mce-danger class added to the wordcount status in the statusbar
			wc[0].addClass('danger')
			if (wc.length > 1) {
				wc[1].addClass('danger');
			}
		} else {
			wc.text(['Words: {0}', self.getCount()]);

			wc[0].removeClass('danger');
			if (wc.length > 1) {
				wc[1].removeClass('danger');
			}
		}
	}

	editor.on('init', function() {
		var statusbar = editor.theme.panel && editor.theme.panel.find('#statusbar')[0],
			timeout;
		if (statusbar) {

			window.setTimeout(function() {
				
				statusbar.insert({
					type: 'label',
					name: 'wordcount',
					text: ['Words: {0}', self.getCount()],
					classes: 'wordcount',
					disabled: editor.settings.readonly
				}, 0);

				editor.on('setcontent beforeaddundo', update);

				editor.on('keyup', function(e) {
					if (timeout) {
				        clearTimeout(timeout);
        				timeout = null;
					}

				    timeout = window.setTimeout(function() {
				    	update();
				    }, 200);
				});
			}, 0);
		}
	});

	self.getCharCount = function() {
		var tx = editor.getContent({format: 'raw'}),
		tc = tx.length;

		return tc;
	}

	self.getCount = function() {
		var tx = editor.getContent({format: 'raw'});
		var tc = 0;

		if (tx) {
			tx = tx.replace(/\.\.\./g, ' '); // convert ellipses to spaces
			tx = tx.replace(/<.[^<>]*?>/g, ' ').replace(/&nbsp;|&#160;/gi, ' '); // remove html tags and space chars

			// deal with html entities
			tx = tx.replace(/(\w+)(&#?[a-z0-9]+;)+(\w+)/i, "$1$3").replace(/&.+?;/g, ' ');
			tx = tx.replace(cleanre, ''); // remove numbers and punctuation

			var wordArray = tx.match(countre);
			if (wordArray) {
				tc = wordArray.length;
			}
		}

		return tc;
	};
});