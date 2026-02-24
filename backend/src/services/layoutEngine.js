function pageSizeToMm(pageSize, customWidthMm, customHeightMm) {
  if (pageSize === "A4") return { widthMm: 210, heightMm: 297 };
  if (pageSize === "A5") return { widthMm: 148, heightMm: 210 };
  return { widthMm: Number(customWidthMm), heightMm: Number(customHeightMm) };
}

export function buildLayout(layoutConfig, products) {
  const {
    labelWidthMm,
    labelHeightMm,
    pageSize,
    pageWidthMm,
    pageHeightMm,
    columns,
    rows,
    marginTopMm,
    marginLeftMm,
    marginRightMm,
    marginBottomMm,
    gapXmm,
    gapYmm,
    orientation
  } = layoutConfig;

  const page = pageSizeToMm(pageSize, pageWidthMm, pageHeightMm);
  const isLandscape = orientation === "horizontal";

  const effectivePageWidth = isLandscape ? page.heightMm : page.widthMm;
  const effectivePageHeight = isLandscape ? page.widthMm : page.heightMm;

  const slotsPerPage = columns * rows;
  const pages = [];

  products.forEach((product, index) => {
    const pageIndex = Math.floor(index / slotsPerPage);
    const slot = index % slotsPerPage;
    const row = Math.floor(slot / columns);
    const col = slot % columns;

    const x = marginLeftMm + col * (labelWidthMm + gapXmm);
    const y = marginTopMm + row * (labelHeightMm + gapYmm);

    const frameOverflow =
      x + labelWidthMm > effectivePageWidth - marginRightMm ||
      y + labelHeightMm > effectivePageHeight - marginBottomMm;

    if (!pages[pageIndex]) pages[pageIndex] = [];

    pages[pageIndex].push({
      pageIndex,
      slot,
      x,
      y,
      width: labelWidthMm,
      height: labelHeightMm,
      row,
      col,
      frameOverflow,
      product
    });
  });

  return {
    page: {
      widthMm: effectivePageWidth,
      heightMm: effectivePageHeight,
      orientation
    },
    pages,
    totalPages: pages.length
  };
}
