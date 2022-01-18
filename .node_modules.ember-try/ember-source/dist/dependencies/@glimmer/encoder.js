class InstructionEncoderImpl {
  constructor(buffer) {
    this.buffer = buffer;
    this.size = 0;
  }

  encode(type, machine) {
    if (type > 255
    /* TYPE_SIZE */
    ) {
        throw new Error(`Opcode type over 8-bits. Got ${type}.`);
      }

    let first = type | machine | arguments.length - 2 << 8
    /* ARG_SHIFT */
    ;
    this.buffer.push(first);

    for (let i = 2; i < arguments.length; i++) {
      let op = arguments[i];

      if (typeof op === 'number' && op > 2147483647
      /* MAX_SIZE */
      ) {
          throw new Error(`Operand over 32-bits. Got ${op}.`);
        }

      this.buffer.push(op);
    }

    this.size = this.buffer.length;
  }

  patch(position, target) {
    if (this.buffer[position + 1] === -1) {
      this.buffer[position + 1] = target;
    } else {
      throw new Error('Trying to patch operand in populated slot instead of a reserved slot.');
    }
  }

}

export { InstructionEncoderImpl };