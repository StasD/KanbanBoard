const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const utcDateToDateStr = (dt: Date | null) => (dt ? dateFormatter.format(dt) : null);

const utcDateToDateTimeStr = (dt: Date | null) => (dt ? dateTimeFormatter.format(dt) : null);

type TraverseTreeCb = (node: Element) => void;

function traverseTree(node: Element, cb: TraverseTreeCb) {
  if (!node) return;

  cb(node);

  for (const child of node.children) {
    traverseTree(child, cb);
  }
}

export { utcDateToDateStr, utcDateToDateTimeStr, traverseTree };
