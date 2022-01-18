function is(variant) {
  return function (value) {
    return Array.isArray(value) && value[0] === variant;
  };
} // Statements


const isFlushElement = is(12
/* FlushElement */
);

function isAttribute(val) {
  return val[0] === 14
  /* StaticAttr */
  || val[0] === 15
  /* DynamicAttr */
  || val[0] === 22
  /* TrustingDynamicAttr */
  || val[0] === 16
  /* ComponentAttr */
  || val[0] === 24
  /* StaticComponentAttr */
  || val[0] === 23
  /* TrustingComponentAttr */
  || val[0] === 17
  /* AttrSplat */
  || val[0] === 4
  /* Modifier */
  ;
}

function isArgument(val) {
  return val[0] === 21
  /* StaticArg */
  || val[0] === 20
  /* DynamicArg */
  ;
}

function isHelper(expr) {
  return Array.isArray(expr) && expr[0] === 30
  /* Call */
  ;
} // Expressions


const isGet = is(32
/* GetSymbol */
);
export { is, isFlushElement, isAttribute, isArgument, isHelper, isGet };