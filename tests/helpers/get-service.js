import { getContext } from "@ember/test-helpers";

export function getService(name) {
  const { owner } = getContext();

  const service = owner.lookup(`service:${name}`);

  return service;
}
