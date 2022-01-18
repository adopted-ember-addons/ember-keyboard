import { descriptorForProperty, isElementDescriptor, setClassicDecorator } from '@ember/-internals/metal';
import { assert } from '@ember/debug';
import { consumeTag, tagFor, track, updateTag } from '@glimmer/validator';

let wrapGetterSetter = function (target, key, desc) {
  let {
    get: originalGet
  } = desc;
  assert('You attempted to use @dependentKeyCompat on a property that already has been decorated with either @computed or @tracked. @dependentKeyCompat is only necessary for native getters that are not decorated with @computed.', descriptorForProperty(target, key) === undefined);

  if (originalGet !== undefined) {
    desc.get = function () {
      let propertyTag = tagFor(this, key);
      let ret;
      let tag = track(() => {
        ret = originalGet.call(this);
      });
      updateTag(propertyTag, tag);
      consumeTag(tag);
      return ret;
    };
  }

  return desc;
};

export function dependentKeyCompat(target, key, desc) {
  if (!isElementDescriptor([target, key, desc])) {
    desc = target;

    let decorator = function (target, key, _desc, _meta, isClassicDecorator) {
      assert('The @dependentKeyCompat decorator may only be passed a method when used in classic classes. You should decorate getters/setters directly in native classes', isClassicDecorator);
      assert('The dependentKeyCompat() decorator must be passed a getter or setter when used in classic classes', desc !== null && typeof desc === 'object' && (typeof desc.get === 'function' || typeof desc.set === 'function'));
      return wrapGetterSetter(target, key, desc);
    };

    setClassicDecorator(decorator);
    return decorator;
  }

  assert('The @dependentKeyCompat decorator must be applied to getters/setters when used in native classes', desc !== null && typeof desc.get === 'function' || typeof desc.set === 'function');
  return wrapGetterSetter(target, key, desc);
}
setClassicDecorator(dependentKeyCompat);