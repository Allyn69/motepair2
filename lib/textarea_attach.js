/* This contains the textarea binding for ShareJS. This binding is really
* simple, and a bit slow on big documents (Its O(N). However, it requires no
* changes to the DOM and no heavy libraries like ace. It works for any kind of
* text input field.
*
* You probably want to use this binding for small fields on forms and such.
* For code editors or rich text editors or whatever, I recommend something
* heavier.
*/

exports.attach = function(doc, buffer){
  doc.attachTextarea = function(elem, ctx) {

    if (!ctx) ctx = this.createContext();

    if (!ctx.provides.text) throw new Error('Cannot attach to non-text document');

    elem.value = ctx.get();

    // The current value of the element's text is stored so we can quickly check
    // if its been changed in the event handlers. This is mostly for browsers on
    // windows, where the content contains \r\n newlines. applyChange() is only
    // called after the \r\n newlines are converted, and that check is quite
    // slow. So we also cache the string before conversion so we can do a quick
    // check incase the conversion isn't needed.
    var prevvalue;

    // Replace the content of the text area with newText, and transform the
    // current cursor by the specified function.
    var replaceText = function(newText, transformCursor) {
      if (transformCursor) {
        var newSelection = [transformCursor(elem.selectionStart), transformCursor(elem.selectionEnd)];
      }

      // Fixate the window's scroll while we set the element's value. Otherwise
      // the browser scrolls to the element.
      var scrollTop = elem.scrollTop;
      elem.value = newText;
      buffer.setTextViaDiff(newText);
      prevvalue = elem.value; // Not done on one line so the browser can do newline conversion.
      if (elem.scrollTop !== scrollTop) elem.scrollTop = scrollTop;

      // Setting the selection moves the cursor. We'll just have to let your
      // cursor drift if the element isn't active, though usually users don't
      // care.
      if (newSelection && window.document.activeElement === elem) {
        elem.selectionStart = newSelection[0];
        elem.selectionEnd = newSelection[1];
      }
    };


    if(ctx.get() !== "") {
      replaceText(ctx.get());
    }



    // *** remote -> local changes

    ctx.onInsert = function(pos, text) {
      console.log("remote -> local", text)
      var transformCursor = function(cursor) {
        return pos < cursor ? cursor + text.length : cursor;
      };

      // Remove any window-style newline characters. Windows inserts these, and
      // they mess up the generated diff.
      var prev = elem.value.replace(/\r\n/g, '\n');
      replaceText(prev.slice(0, pos) + text + prev.slice(pos), transformCursor);
    };

    ctx.onRemove = function(pos, length) {
      var transformCursor = function(cursor) {
        // If the cursor is inside the deleted region, we only want to move back to the start
        // of the region. Hence the Math.min.
        return pos < cursor ? cursor - Math.min(length, cursor - pos) : cursor;
      };

      var prev = elem.value.replace(/\r\n/g, '\n');
      replaceText(prev.slice(0, pos) + prev.slice(pos + length), transformCursor);
    };


    // *** local -> remote changes

    // This function generates operations from the changed content in the textarea.
    var genOp = function(event) {
      console.log("local -> remote")
      // In a timeout so the browser has time to propogate the event's changes to the DOM.
      setTimeout(function() {
        if (elem.value !== prevvalue) {
          prevvalue = elem.value;
          applyChange(ctx, ctx.get(), elem.value.replace(/\r\n/g, '\n'));
        }
      }, 0);
    };

    var eventNames = ['textInput', 'keydown', 'keyup', 'select', 'cut', 'paste'];
    for (var i = 0; i < eventNames.length; i++) {
      var e = eventNames[i];
      if (elem.addEventListener) {
        elem.addEventListener(e, genOp, false);
      } else {
        elem.attachEvent('on' + e, genOp);
      }
    }

    ctx.detach = function() {
      for (var i = 0; i < eventNames.length; i++) {
        var e = eventNames[i];
        if (elem.removeEventListener) {
          elem.removeEventListener(e, genOp, false);
        } else {
          elem.detachEvent('on' + e, genOp);
        }
      }
    };

    return ctx;
  };
}
/* applyChange creates the edits to convert oldval -> newval.
*
* This function should be called every time the text element is changed.
* Because changes are always localised, the diffing is quite easy. We simply
* scan in from the start and scan in from the end to isolate the edited range,
* then delete everything that was removed & add everything that was added.
* This wouldn't work for complex changes, but this function should be called
* on keystroke - so the edits will mostly just be single character changes.
* Sometimes they'll paste text over other text, but even then the diff
* generated by this algorithm is correct.
*
* This algorithm is O(N). I suspect you could speed it up somehow using regular expressions.
*/
var applyChange = function(ctx, oldval, newval) {
  // Strings are immutable and have reference equality. I think this test is O(1), so its worth doing.
  if (oldval === newval) return;

  var commonStart = 0;
  while (oldval.charAt(commonStart) === newval.charAt(commonStart)) {
    commonStart++;
  }

  var commonEnd = 0;
  while (oldval.charAt(oldval.length - 1 - commonEnd) === newval.charAt(newval.length - 1 - commonEnd) &&
    commonEnd + commonStart < oldval.length && commonEnd + commonStart < newval.length) {
      commonEnd++;
    }

    if (oldval.length !== commonStart + commonEnd) {
      ctx.remove(commonStart, oldval.length - commonStart - commonEnd);
    }
    if (newval.length !== commonStart + commonEnd) {
      ctx.insert(commonStart, newval.slice(commonStart, newval.length - commonEnd));
    }
  };

  // Attach a textarea to a document's editing context.
  //
  // The context is optional, and will be created from the document if its not
  // specified.