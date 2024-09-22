import { useEffect, useState } from "react";

let subscribers = new Set<Function>();
let activeEffect: Function | null = null


function track() {
    if (activeEffect) {
        subscribers.add(activeEffect)
    }
}

const trigger = () => {
    subscribers.forEach((subscriber) => subscriber());
};
export const proxify = <T extends object>(obj: T) => {
    const handler = {
        get(target: T, key: string, receiver: ProxyConstructor) {
            const result = Reflect.get(target, key, receiver);
            track()
            return result;
        },
        set(target: T, key: string, value: any, receiver: ProxyConstructor) {
            const result = Reflect.set(target, key, value, receiver);
            trigger()
            return result;
        },
    }

    return new Proxy(obj, handler)
};

export const effect = (fn: Function) => {
    activeEffect = fn

    if (activeEffect) activeEffect()
    const cleanupFn = () => {
        subscribers.delete(fn);
    };

    activeEffect = null
    return cleanupFn;
};

export const useProxifyProperty = <T extends object>(store: T, key: keyof T) => {
    const [value, setValue] = useState(store[key]);
  
    useEffect(() => {
      const unsubscribe = effect(() => {
        setValue(store[key]);
      });
  
      return () => {
        unsubscribe();
      };
    }, []);
  
    return value;
  };
  
