class Storage {
  constructor() {
    this.array = [];
    this.next = 0;
  }

  add(element) {
    let {
      next: slot,
      array
    } = this;

    if (slot === array.length) {
      this.next++;
    } else {
      let prev = array[slot];
      this.next = prev;
    }

    this.array[slot] = element;
    return slot;
  }

  deref(pointer) {
    return this.array[pointer];
  }

  drop(pointer) {
    this.array[pointer] = this.next;
    this.next = pointer;
  }

}

class Stack {
  constructor(vec = []) {
    this.vec = vec;
  }

  clone() {
    return new Stack(this.vec.slice());
  }

  sliceFrom(start) {
    return new Stack(this.vec.slice(start));
  }

  slice(start, end) {
    return new Stack(this.vec.slice(start, end));
  }

  copy(from, to) {
    this.vec[to] = this.vec[from];
  } // TODO: how to model u64 argument?


  writeRaw(pos, value) {
    // TODO: Grow?
    this.vec[pos] = value;
  } // TODO: partially decoded enum?


  getRaw(pos) {
    return this.vec[pos];
  }

  reset() {
    this.vec.length = 0;
  }

  len() {
    return this.vec.length;
  }

}

export { Storage, Stack };