import errorHandler from './errorHandler';
import { handleMiddlewares } from './middlewares';
import { applyAsyncData, sanitizeComponent } from './asyncData';
import { getContext } from './context';

const findAsyncDataComponents = (parent, components = []) => {
  for (const child of parent.$children) {
    if (child.$vnode.data.routerView) {
      components.push(child);
    }
    if (child.$children.length) {
      findAsyncDataComponents(child, components);
    }
  }
  return components;
};

export const addHotReload = context => {
  if (!module.hot) return;

  console.log('addHotReload');

  const { app, router } = context;
  const components = findAsyncDataComponents(app);

  for (const depth in components) {
    const component = components[depth];
    const _forceUpdate = component.$forceUpdate.bind(component.$parent);

    component.$vnode.context.$forceUpdate = async () => {
      console.log('forceUpdate');

      const routeComponents = router.getMatchedComponents(router.currentRoute);
      const Component = sanitizeComponent(routeComponents[depth]);

      if (Component && Component.options.asyncData) {
        const data = await Component.options.asyncData(getContext(context));
        applyAsyncData(Component, data);
      }

      return _forceUpdate();
    };
  }
};

export const handleHMRMiddlewares = async context => {
  onHotReload(() => {
    handleMiddlewares(context.router.currentRoute, context).catch(error =>
      errorHandler(context, { error }),
    );
  });
};

const onHotReload = callback => {
  if (process.client && module.hot) {
    module.hot.addStatusHandler(status => {
      if (status === 'idle') callback();
    });
  }
};
