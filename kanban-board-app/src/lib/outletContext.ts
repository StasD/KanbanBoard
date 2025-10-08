interface OutletContext {
  setBreadcrumbPath: React.Dispatch<React.SetStateAction<string | null>>;
  setUseFixedLayout: React.Dispatch<React.SetStateAction<boolean>>;
}

export { type OutletContext };
