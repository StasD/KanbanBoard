function utcDateToDateStr(dt?: Date | null) {
  return dt
    ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }).format(dt)
    : null;
}

type TraverseTreeCb = (node: Element) => void;

function traverseTree(node: Element, cb: TraverseTreeCb) {
  if (!node) return;

  cb(node);

  for (const child of node.children) {
    traverseTree(child, cb);
  }
}

export { utcDateToDateStr, traverseTree };
