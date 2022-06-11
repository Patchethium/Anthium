
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*!
    * tabbable 5.3.2
    * @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
    */
    var candidateSelectors = ['input', 'select', 'textarea', 'a[href]', 'button', '[tabindex]:not(slot)', 'audio[controls]', 'video[controls]', '[contenteditable]:not([contenteditable="false"])', 'details>summary:first-of-type', 'details'];
    var candidateSelector = /* #__PURE__ */candidateSelectors.join(',');
    var NoElement = typeof Element === 'undefined';
    var matches = NoElement ? function () {} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    var getRootNode = !NoElement && Element.prototype.getRootNode ? function (element) {
      return element.getRootNode();
    } : function (element) {
      return element.ownerDocument;
    };
    /**
     * @param {Element} el container to check in
     * @param {boolean} includeContainer add container to check
     * @param {(node: Element) => boolean} filter filter candidates
     * @returns {Element[]}
     */

    var getCandidates = function getCandidates(el, includeContainer, filter) {
      var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));

      if (includeContainer && matches.call(el, candidateSelector)) {
        candidates.unshift(el);
      }

      candidates = candidates.filter(filter);
      return candidates;
    };
    /**
     * @callback GetShadowRoot
     * @param {Element} element to check for shadow root
     * @returns {ShadowRoot|boolean} ShadowRoot if available or boolean indicating if a shadowRoot is attached but not available.
     */

    /**
     * @typedef {Object} CandidatesScope
     * @property {Element} scope contains inner candidates
     * @property {Element[]} candidates
     */

    /**
     * @typedef {Object} IterativeOptions
     * @property {GetShadowRoot|boolean} getShadowRoot true if shadow support is enabled; falsy if not;
     *  if a function, implies shadow support is enabled and either returns the shadow root of an element
     *  or a boolean stating if it has an undisclosed shadow root
     * @property {(node: Element) => boolean} filter filter candidates
     * @property {boolean} flatten if true then result will flatten any CandidatesScope into the returned list
     */

    /**
     * @param {Element[]} elements list of element containers to match candidates from
     * @param {boolean} includeContainer add container list to check
     * @param {IterativeOptions} options
     * @returns {Array.<Element|CandidatesScope>}
     */


    var getCandidatesIteratively = function getCandidatesIteratively(elements, includeContainer, options) {
      var candidates = [];
      var elementsToCheck = Array.from(elements);

      while (elementsToCheck.length) {
        var element = elementsToCheck.shift();

        if (element.tagName === 'SLOT') {
          // add shadow dom slot scope (slot itself cannot be focusable)
          var assigned = element.assignedElements();
          var content = assigned.length ? assigned : element.children;
          var nestedCandidates = getCandidatesIteratively(content, true, options);

          if (options.flatten) {
            candidates.push.apply(candidates, nestedCandidates);
          } else {
            candidates.push({
              scope: element,
              candidates: nestedCandidates
            });
          }
        } else {
          // check candidate element
          var validCandidate = matches.call(element, candidateSelector);

          if (validCandidate && options.filter(element) && (includeContainer || !elements.includes(element))) {
            candidates.push(element);
          } // iterate over shadow content if possible


          var shadowRoot = element.shadowRoot || // check for an undisclosed shadow
          typeof options.getShadowRoot === 'function' && options.getShadowRoot(element);

          if (shadowRoot) {
            // add shadow dom scope IIF a shadow root node was given; otherwise, an undisclosed
            //  shadow exists, so look at light dom children as fallback BUT create a scope for any
            //  child candidates found because they're likely slotted elements (elements that are
            //  children of the web component element (which has the shadow), in the light dom, but
            //  slotted somewhere _inside_ the undisclosed shadow) -- the scope is created below,
            //  _after_ we return from this recursive call
            var _nestedCandidates = getCandidatesIteratively(shadowRoot === true ? element.children : shadowRoot.children, true, options);

            if (options.flatten) {
              candidates.push.apply(candidates, _nestedCandidates);
            } else {
              candidates.push({
                scope: element,
                candidates: _nestedCandidates
              });
            }
          } else {
            // there's not shadow so just dig into the element's (light dom) children
            //  __without__ giving the element special scope treatment
            elementsToCheck.unshift.apply(elementsToCheck, element.children);
          }
        }
      }

      return candidates;
    };

    var getTabindex = function getTabindex(node, isScope) {
      if (node.tabIndex < 0) {
        // in Chrome, <details/>, <audio controls/> and <video controls/> elements get a default
        // `tabIndex` of -1 when the 'tabindex' attribute isn't specified in the DOM,
        // yet they are still part of the regular tab order; in FF, they get a default
        // `tabIndex` of 0; since Chrome still puts those elements in the regular tab
        // order, consider their tab index to be 0.
        // Also browsers do not return `tabIndex` correctly for contentEditable nodes;
        // so if they don't have a tabindex attribute specifically set, assume it's 0.
        //
        // isScope is positive for custom element with shadow root or slot that by default
        // have tabIndex -1, but need to be sorted by document order in order for their
        // content to be inserted in the correct position
        if ((isScope || /^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || node.isContentEditable) && isNaN(parseInt(node.getAttribute('tabindex'), 10))) {
          return 0;
        }
      }

      return node.tabIndex;
    };

    var sortOrderedTabbables = function sortOrderedTabbables(a, b) {
      return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
    };

    var isInput = function isInput(node) {
      return node.tagName === 'INPUT';
    };

    var isHiddenInput = function isHiddenInput(node) {
      return isInput(node) && node.type === 'hidden';
    };

    var isDetailsWithSummary = function isDetailsWithSummary(node) {
      var r = node.tagName === 'DETAILS' && Array.prototype.slice.apply(node.children).some(function (child) {
        return child.tagName === 'SUMMARY';
      });
      return r;
    };

    var getCheckedRadio = function getCheckedRadio(nodes, form) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].checked && nodes[i].form === form) {
          return nodes[i];
        }
      }
    };

    var isTabbableRadio = function isTabbableRadio(node) {
      if (!node.name) {
        return true;
      }

      var radioScope = node.form || getRootNode(node);

      var queryRadios = function queryRadios(name) {
        return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
      };

      var radioSet;

      if (typeof window !== 'undefined' && typeof window.CSS !== 'undefined' && typeof window.CSS.escape === 'function') {
        radioSet = queryRadios(window.CSS.escape(node.name));
      } else {
        try {
          radioSet = queryRadios(node.name);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s', err.message);
          return false;
        }
      }

      var checked = getCheckedRadio(radioSet, node.form);
      return !checked || checked === node;
    };

    var isRadio = function isRadio(node) {
      return isInput(node) && node.type === 'radio';
    };

    var isNonTabbableRadio = function isNonTabbableRadio(node) {
      return isRadio(node) && !isTabbableRadio(node);
    };

    var isZeroArea = function isZeroArea(node) {
      var _node$getBoundingClie = node.getBoundingClientRect(),
          width = _node$getBoundingClie.width,
          height = _node$getBoundingClie.height;

      return width === 0 && height === 0;
    };

    var isHidden = function isHidden(node, _ref) {
      var displayCheck = _ref.displayCheck,
          getShadowRoot = _ref.getShadowRoot;

      // NOTE: visibility will be `undefined` if node is detached from the document
      //  (see notes about this further down), which means we will consider it visible
      //  (this is legacy behavior from a very long way back)
      // NOTE: we check this regardless of `displayCheck="none"` because this is a
      //  _visibility_ check, not a _display_ check
      if (getComputedStyle(node).visibility === 'hidden') {
        return true;
      }

      var isDirectSummary = matches.call(node, 'details>summary:first-of-type');
      var nodeUnderDetails = isDirectSummary ? node.parentElement : node;

      if (matches.call(nodeUnderDetails, 'details:not([open]) *')) {
        return true;
      } // The root node is the shadow root if the node is in a shadow DOM; some document otherwise
      //  (but NOT _the_ document; see second 'If' comment below for more).
      // If rootNode is shadow root, it'll have a host, which is the element to which the shadow
      //  is attached, and the one we need to check if it's in the document or not (because the
      //  shadow, and all nodes it contains, is never considered in the document since shadows
      //  behave like self-contained DOMs; but if the shadow's HOST, which is part of the document,
      //  is hidden, or is not in the document itself but is detached, it will affect the shadow's
      //  visibility, including all the nodes it contains). The host could be any normal node,
      //  or a custom element (i.e. web component). Either way, that's the one that is considered
      //  part of the document, not the shadow root, nor any of its children (i.e. the node being
      //  tested).
      // If rootNode is not a shadow root, it won't have a host, and so rootNode should be the
      //  document (per the docs) and while it's a Document-type object, that document does not
      //  appear to be the same as the node's `ownerDocument` for some reason, so it's safer
      //  to ignore the rootNode at this point, and use `node.ownerDocument`. Otherwise,
      //  using `rootNode.contains(node)` will _always_ be true we'll get false-positives when
      //  node is actually detached.


      var nodeRootHost = getRootNode(node).host;
      var nodeIsAttached = (nodeRootHost === null || nodeRootHost === void 0 ? void 0 : nodeRootHost.ownerDocument.contains(nodeRootHost)) || node.ownerDocument.contains(node);

      if (!displayCheck || displayCheck === 'full') {
        if (typeof getShadowRoot === 'function') {
          // figure out if we should consider the node to be in an undisclosed shadow and use the
          //  'non-zero-area' fallback
          var originalNode = node;

          while (node) {
            var parentElement = node.parentElement;
            var rootNode = getRootNode(node);

            if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true // check if there's an undisclosed shadow
            ) {
              // node has an undisclosed shadow which means we can only treat it as a black box, so we
              //  fall back to a non-zero-area test
              return isZeroArea(node);
            } else if (node.assignedSlot) {
              // iterate up slot
              node = node.assignedSlot;
            } else if (!parentElement && rootNode !== node.ownerDocument) {
              // cross shadow boundary
              node = rootNode.host;
            } else {
              // iterate up normal dom
              node = parentElement;
            }
          }

          node = originalNode;
        } // else, `getShadowRoot` might be true, but all that does is enable shadow DOM support
        //  (i.e. it does not also presume that all nodes might have undisclosed shadows); or
        //  it might be a falsy value, which means shadow DOM support is disabled
        // Since we didn't find it sitting in an undisclosed shadow (or shadows are disabled)
        //  now we can just test to see if it would normally be visible or not, provided it's
        //  attached to the main document.
        // NOTE: We must consider case where node is inside a shadow DOM and given directly to
        //  `isTabbable()` or `isFocusable()` -- regardless of `getShadowRoot` option setting.


        if (nodeIsAttached) {
          // this works wherever the node is: if there's at least one client rect, it's
          //  somehow displayed; it also covers the CSS 'display: contents' case where the
          //  node itself is hidden in place of its contents; and there's no need to search
          //  up the hierarchy either
          return !node.getClientRects().length;
        } // Else, the node isn't attached to the document, which means the `getClientRects()`
        //  API will __always__ return zero rects (this can happen, for example, if React
        //  is used to render nodes onto a detached tree, as confirmed in this thread:
        //  https://github.com/facebook/react/issues/9117#issuecomment-284228870)
        //
        // It also means that even window.getComputedStyle(node).display will return `undefined`
        //  because styles are only computed for nodes that are in the document.
        //
        // NOTE: THIS HAS BEEN THE CASE FOR YEARS. It is not new, nor is it caused by tabbable
        //  somehow. Though it was never stated officially, anyone who has ever used tabbable
        //  APIs on nodes in detached containers has actually implicitly used tabbable in what
        //  was later (as of v5.2.0 on Apr 9, 2021) called `displayCheck="none"` mode -- essentially
        //  considering __everything__ to be visible because of the innability to determine styles.

      } else if (displayCheck === 'non-zero-area') {
        // NOTE: Even though this tests that the node's client rect is non-zero to determine
        //  whether it's displayed, and that a detached node will __always__ have a zero-area
        //  client rect, we don't special-case for whether the node is attached or not. In
        //  this mode, we do want to consider nodes that have a zero area to be hidden at all
        //  times, and that includes attached or not.
        return isZeroArea(node);
      } // visible, as far as we can tell, or per current `displayCheck` mode


      return false;
    }; // form fields (nested) inside a disabled fieldset are not focusable/tabbable
    //  unless they are in the _first_ <legend> element of the top-most disabled
    //  fieldset


    var isDisabledFromFieldset = function isDisabledFromFieldset(node) {
      if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
        var parentNode = node.parentElement; // check if `node` is contained in a disabled <fieldset>

        while (parentNode) {
          if (parentNode.tagName === 'FIELDSET' && parentNode.disabled) {
            // look for the first <legend> among the children of the disabled <fieldset>
            for (var i = 0; i < parentNode.children.length; i++) {
              var child = parentNode.children.item(i); // when the first <legend> (in document order) is found

              if (child.tagName === 'LEGEND') {
                // if its parent <fieldset> is not nested in another disabled <fieldset>,
                // return whether `node` is a descendant of its first <legend>
                return matches.call(parentNode, 'fieldset[disabled] *') ? true : !child.contains(node);
              }
            } // the disabled <fieldset> containing `node` has no <legend>


            return true;
          }

          parentNode = parentNode.parentElement;
        }
      } // else, node's tabbable/focusable state should not be affected by a fieldset's
      //  enabled/disabled state


      return false;
    };

    var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable(options, node) {
      if (node.disabled || isHiddenInput(node) || isHidden(node, options) || // For a details element with a summary, the summary element gets the focus
      isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
        return false;
      }

      return true;
    };

    var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable(options, node) {
      if (isNonTabbableRadio(node) || getTabindex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) {
        return false;
      }

      return true;
    };
    /**
     * @param {Array.<Element|CandidatesScope>} candidates
     * @returns Element[]
     */


    var sortByOrder = function sortByOrder(candidates) {
      var regularTabbables = [];
      var orderedTabbables = [];
      candidates.forEach(function (item, i) {
        var isScope = !!item.scope;
        var element = isScope ? item.scope : item;
        var candidateTabindex = getTabindex(element, isScope);
        var elements = isScope ? sortByOrder(item.candidates) : element;

        if (candidateTabindex === 0) {
          isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
        } else {
          orderedTabbables.push({
            documentOrder: i,
            tabIndex: candidateTabindex,
            item: item,
            isScope: isScope,
            content: elements
          });
        }
      });
      return orderedTabbables.sort(sortOrderedTabbables).reduce(function (acc, sortable) {
        sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
        return acc;
      }, []).concat(regularTabbables);
    };

    var tabbable = function tabbable(el, options) {
      options = options || {};
      var candidates;

      if (options.getShadowRoot) {
        candidates = getCandidatesIteratively([el], options.includeContainer, {
          filter: isNodeMatchingSelectorTabbable.bind(null, options),
          flatten: false,
          getShadowRoot: options.getShadowRoot
        });
      } else {
        candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
      }

      return sortByOrder(candidates);
    };

    var focusable = function focusable(el, options) {
      options = options || {};
      var candidates;

      if (options.getShadowRoot) {
        candidates = getCandidatesIteratively([el], options.includeContainer, {
          filter: isNodeMatchingSelectorFocusable.bind(null, options),
          flatten: true,
          getShadowRoot: options.getShadowRoot
        });
      } else {
        candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
      }

      return candidates;
    };

    var isTabbable = function isTabbable(node, options) {
      options = options || {};

      if (!node) {
        throw new Error('No node provided');
      }

      if (matches.call(node, candidateSelector) === false) {
        return false;
      }

      return isNodeMatchingSelectorTabbable(options, node);
    };

    var focusableCandidateSelector = /* #__PURE__ */candidateSelectors.concat('iframe').join(',');

    var isFocusable = function isFocusable(node, options) {
      options = options || {};

      if (!node) {
        throw new Error('No node provided');
      }

      if (matches.call(node, focusableCandidateSelector) === false) {
        return false;
      }

      return isNodeMatchingSelectorFocusable(options, node);
    };

    /*!
    * focus-trap 6.9.1
    * @license MIT, https://github.com/focus-trap/focus-trap/blob/master/LICENSE
    */

    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }

      return keys;
    }

    function _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }

      return target;
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    var activeFocusTraps = function () {
      var trapQueue = [];
      return {
        activateTrap: function activateTrap(trap) {
          if (trapQueue.length > 0) {
            var activeTrap = trapQueue[trapQueue.length - 1];

            if (activeTrap !== trap) {
              activeTrap.pause();
            }
          }

          var trapIndex = trapQueue.indexOf(trap);

          if (trapIndex === -1) {
            trapQueue.push(trap);
          } else {
            // move this existing trap to the front of the queue
            trapQueue.splice(trapIndex, 1);
            trapQueue.push(trap);
          }
        },
        deactivateTrap: function deactivateTrap(trap) {
          var trapIndex = trapQueue.indexOf(trap);

          if (trapIndex !== -1) {
            trapQueue.splice(trapIndex, 1);
          }

          if (trapQueue.length > 0) {
            trapQueue[trapQueue.length - 1].unpause();
          }
        }
      };
    }();

    var isSelectableInput = function isSelectableInput(node) {
      return node.tagName && node.tagName.toLowerCase() === 'input' && typeof node.select === 'function';
    };

    var isEscapeEvent = function isEscapeEvent(e) {
      return e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
    };

    var isTabEvent = function isTabEvent(e) {
      return e.key === 'Tab' || e.keyCode === 9;
    };

    var delay = function delay(fn) {
      return setTimeout(fn, 0);
    }; // Array.find/findIndex() are not supported on IE; this replicates enough
    //  of Array.findIndex() for our needs


    var findIndex = function findIndex(arr, fn) {
      var idx = -1;
      arr.every(function (value, i) {
        if (fn(value)) {
          idx = i;
          return false; // break
        }

        return true; // next
      });
      return idx;
    };
    /**
     * Get an option's value when it could be a plain value, or a handler that provides
     *  the value.
     * @param {*} value Option's value to check.
     * @param {...*} [params] Any parameters to pass to the handler, if `value` is a function.
     * @returns {*} The `value`, or the handler's returned value.
     */


    var valueOrHandler = function valueOrHandler(value) {
      for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        params[_key - 1] = arguments[_key];
      }

      return typeof value === 'function' ? value.apply(void 0, params) : value;
    };

    var getActualTarget = function getActualTarget(event) {
      // NOTE: If the trap is _inside_ a shadow DOM, event.target will always be the
      //  shadow host. However, event.target.composedPath() will be an array of
      //  nodes "clicked" from inner-most (the actual element inside the shadow) to
      //  outer-most (the host HTML document). If we have access to composedPath(),
      //  then use its first element; otherwise, fall back to event.target (and
      //  this only works for an _open_ shadow DOM; otherwise,
      //  composedPath()[0] === event.target always).
      return event.target.shadowRoot && typeof event.composedPath === 'function' ? event.composedPath()[0] : event.target;
    };

    var createFocusTrap = function createFocusTrap(elements, userOptions) {
      // SSR: a live trap shouldn't be created in this type of environment so this
      //  should be safe code to execute if the `document` option isn't specified
      var doc = (userOptions === null || userOptions === void 0 ? void 0 : userOptions.document) || document;

      var config = _objectSpread2({
        returnFocusOnDeactivate: true,
        escapeDeactivates: true,
        delayInitialFocus: true
      }, userOptions);

      var state = {
        // containers given to createFocusTrap()
        // @type {Array<HTMLElement>}
        containers: [],
        // list of objects identifying tabbable nodes in `containers` in the trap
        // NOTE: it's possible that a group has no tabbable nodes if nodes get removed while the trap
        //  is active, but the trap should never get to a state where there isn't at least one group
        //  with at least one tabbable node in it (that would lead to an error condition that would
        //  result in an error being thrown)
        // @type {Array<{
        //   container: HTMLElement,
        //   tabbableNodes: Array<HTMLElement>, // empty if none
        //   focusableNodes: Array<HTMLElement>, // empty if none
        //   firstTabbableNode: HTMLElement|null,
        //   lastTabbableNode: HTMLElement|null,
        //   nextTabbableNode: (node: HTMLElement, forward: boolean) => HTMLElement|undefined
        // }>}
        containerGroups: [],
        // same order/length as `containers` list
        // references to objects in `containerGroups`, but only those that actually have
        //  tabbable nodes in them
        // NOTE: same order as `containers` and `containerGroups`, but __not necessarily__
        //  the same length
        tabbableGroups: [],
        nodeFocusedBeforeActivation: null,
        mostRecentlyFocusedNode: null,
        active: false,
        paused: false,
        // timer ID for when delayInitialFocus is true and initial focus in this trap
        //  has been delayed during activation
        delayInitialFocusTimer: undefined
      };
      var trap; // eslint-disable-line prefer-const -- some private functions reference it, and its methods reference private functions, so we must declare here and define later

      /**
       * Gets a configuration option value.
       * @param {Object|undefined} configOverrideOptions If true, and option is defined in this set,
       *  value will be taken from this object. Otherwise, value will be taken from base configuration.
       * @param {string} optionName Name of the option whose value is sought.
       * @param {string|undefined} [configOptionName] Name of option to use __instead of__ `optionName`
       *  IIF `configOverrideOptions` is not defined. Otherwise, `optionName` is used.
       */

      var getOption = function getOption(configOverrideOptions, optionName, configOptionName) {
        return configOverrideOptions && configOverrideOptions[optionName] !== undefined ? configOverrideOptions[optionName] : config[configOptionName || optionName];
      };
      /**
       * Finds the index of the container that contains the element.
       * @param {HTMLElement} element
       * @returns {number} Index of the container in either `state.containers` or
       *  `state.containerGroups` (the order/length of these lists are the same); -1
       *  if the element isn't found.
       */


      var findContainerIndex = function findContainerIndex(element) {
        // NOTE: search `containerGroups` because it's possible a group contains no tabbable
        //  nodes, but still contains focusable nodes (e.g. if they all have `tabindex=-1`)
        //  and we still need to find the element in there
        return state.containerGroups.findIndex(function (_ref) {
          var container = _ref.container,
              tabbableNodes = _ref.tabbableNodes;
          return container.contains(element) || // fall back to explicit tabbable search which will take into consideration any
          //  web components if the `tabbableOptions.getShadowRoot` option was used for
          //  the trap, enabling shadow DOM support in tabbable (`Node.contains()` doesn't
          //  look inside web components even if open)
          tabbableNodes.find(function (node) {
            return node === element;
          });
        });
      };
      /**
       * Gets the node for the given option, which is expected to be an option that
       *  can be either a DOM node, a string that is a selector to get a node, `false`
       *  (if a node is explicitly NOT given), or a function that returns any of these
       *  values.
       * @param {string} optionName
       * @returns {undefined | false | HTMLElement | SVGElement} Returns
       *  `undefined` if the option is not specified; `false` if the option
       *  resolved to `false` (node explicitly not given); otherwise, the resolved
       *  DOM node.
       * @throws {Error} If the option is set, not `false`, and is not, or does not
       *  resolve to a node.
       */


      var getNodeForOption = function getNodeForOption(optionName) {
        var optionValue = config[optionName];

        if (typeof optionValue === 'function') {
          for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            params[_key2 - 1] = arguments[_key2];
          }

          optionValue = optionValue.apply(void 0, params);
        }

        if (!optionValue) {
          if (optionValue === undefined || optionValue === false) {
            return optionValue;
          } // else, empty string (invalid), null (invalid), 0 (invalid)


          throw new Error("`".concat(optionName, "` was specified but was not a node, or did not return a node"));
        }

        var node = optionValue; // could be HTMLElement, SVGElement, or non-empty string at this point

        if (typeof optionValue === 'string') {
          node = doc.querySelector(optionValue); // resolve to node, or null if fails

          if (!node) {
            throw new Error("`".concat(optionName, "` as selector refers to no known node"));
          }
        }

        return node;
      };

      var getInitialFocusNode = function getInitialFocusNode() {
        var node = getNodeForOption('initialFocus'); // false explicitly indicates we want no initialFocus at all

        if (node === false) {
          return false;
        }

        if (node === undefined) {
          // option not specified: use fallback options
          if (findContainerIndex(doc.activeElement) >= 0) {
            node = doc.activeElement;
          } else {
            var firstTabbableGroup = state.tabbableGroups[0];
            var firstTabbableNode = firstTabbableGroup && firstTabbableGroup.firstTabbableNode; // NOTE: `fallbackFocus` option function cannot return `false` (not supported)

            node = firstTabbableNode || getNodeForOption('fallbackFocus');
          }
        }

        if (!node) {
          throw new Error('Your focus-trap needs to have at least one focusable element');
        }

        return node;
      };

      var updateTabbableNodes = function updateTabbableNodes() {
        state.containerGroups = state.containers.map(function (container) {
          var tabbableNodes = tabbable(container, config.tabbableOptions); // NOTE: if we have tabbable nodes, we must have focusable nodes; focusable nodes
          //  are a superset of tabbable nodes

          var focusableNodes = focusable(container, config.tabbableOptions);
          return {
            container: container,
            tabbableNodes: tabbableNodes,
            focusableNodes: focusableNodes,
            firstTabbableNode: tabbableNodes.length > 0 ? tabbableNodes[0] : null,
            lastTabbableNode: tabbableNodes.length > 0 ? tabbableNodes[tabbableNodes.length - 1] : null,

            /**
             * Finds the __tabbable__ node that follows the given node in the specified direction,
             *  in this container, if any.
             * @param {HTMLElement} node
             * @param {boolean} [forward] True if going in forward tab order; false if going
             *  in reverse.
             * @returns {HTMLElement|undefined} The next tabbable node, if any.
             */
            nextTabbableNode: function nextTabbableNode(node) {
              var forward = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
              // NOTE: If tabindex is positive (in order to manipulate the tab order separate
              //  from the DOM order), this __will not work__ because the list of focusableNodes,
              //  while it contains tabbable nodes, does not sort its nodes in any order other
              //  than DOM order, because it can't: Where would you place focusable (but not
              //  tabbable) nodes in that order? They have no order, because they aren't tabbale...
              // Support for positive tabindex is already broken and hard to manage (possibly
              //  not supportable, TBD), so this isn't going to make things worse than they
              //  already are, and at least makes things better for the majority of cases where
              //  tabindex is either 0/unset or negative.
              // FYI, positive tabindex issue: https://github.com/focus-trap/focus-trap/issues/375
              var nodeIdx = focusableNodes.findIndex(function (n) {
                return n === node;
              });

              if (nodeIdx < 0) {
                return undefined;
              }

              if (forward) {
                return focusableNodes.slice(nodeIdx + 1).find(function (n) {
                  return isTabbable(n, config.tabbableOptions);
                });
              }

              return focusableNodes.slice(0, nodeIdx).reverse().find(function (n) {
                return isTabbable(n, config.tabbableOptions);
              });
            }
          };
        });
        state.tabbableGroups = state.containerGroups.filter(function (group) {
          return group.tabbableNodes.length > 0;
        }); // throw if no groups have tabbable nodes and we don't have a fallback focus node either

        if (state.tabbableGroups.length <= 0 && !getNodeForOption('fallbackFocus') // returning false not supported for this option
        ) {
          throw new Error('Your focus-trap must have at least one container with at least one tabbable node in it at all times');
        }
      };

      var tryFocus = function tryFocus(node) {
        if (node === false) {
          return;
        }

        if (node === doc.activeElement) {
          return;
        }

        if (!node || !node.focus) {
          tryFocus(getInitialFocusNode());
          return;
        }

        node.focus({
          preventScroll: !!config.preventScroll
        });
        state.mostRecentlyFocusedNode = node;

        if (isSelectableInput(node)) {
          node.select();
        }
      };

      var getReturnFocusNode = function getReturnFocusNode(previousActiveElement) {
        var node = getNodeForOption('setReturnFocus', previousActiveElement);
        return node ? node : node === false ? false : previousActiveElement;
      }; // This needs to be done on mousedown and touchstart instead of click
      // so that it precedes the focus event.


      var checkPointerDown = function checkPointerDown(e) {
        var target = getActualTarget(e);

        if (findContainerIndex(target) >= 0) {
          // allow the click since it ocurred inside the trap
          return;
        }

        if (valueOrHandler(config.clickOutsideDeactivates, e)) {
          // immediately deactivate the trap
          trap.deactivate({
            // if, on deactivation, we should return focus to the node originally-focused
            //  when the trap was activated (or the configured `setReturnFocus` node),
            //  then assume it's also OK to return focus to the outside node that was
            //  just clicked, causing deactivation, as long as that node is focusable;
            //  if it isn't focusable, then return focus to the original node focused
            //  on activation (or the configured `setReturnFocus` node)
            // NOTE: by setting `returnFocus: false`, deactivate() will do nothing,
            //  which will result in the outside click setting focus to the node
            //  that was clicked, whether it's focusable or not; by setting
            //  `returnFocus: true`, we'll attempt to re-focus the node originally-focused
            //  on activation (or the configured `setReturnFocus` node)
            returnFocus: config.returnFocusOnDeactivate && !isFocusable(target, config.tabbableOptions)
          });
          return;
        } // This is needed for mobile devices.
        // (If we'll only let `click` events through,
        // then on mobile they will be blocked anyways if `touchstart` is blocked.)


        if (valueOrHandler(config.allowOutsideClick, e)) {
          // allow the click outside the trap to take place
          return;
        } // otherwise, prevent the click


        e.preventDefault();
      }; // In case focus escapes the trap for some strange reason, pull it back in.


      var checkFocusIn = function checkFocusIn(e) {
        var target = getActualTarget(e);
        var targetContained = findContainerIndex(target) >= 0; // In Firefox when you Tab out of an iframe the Document is briefly focused.

        if (targetContained || target instanceof Document) {
          if (targetContained) {
            state.mostRecentlyFocusedNode = target;
          }
        } else {
          // escaped! pull it back in to where it just left
          e.stopImmediatePropagation();
          tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
        }
      }; // Hijack Tab events on the first and last focusable nodes of the trap,
      // in order to prevent focus from escaping. If it escapes for even a
      // moment it can end up scrolling the page and causing confusion so we
      // kind of need to capture the action at the keydown phase.


      var checkTab = function checkTab(e) {
        var target = getActualTarget(e);
        updateTabbableNodes();
        var destinationNode = null;

        if (state.tabbableGroups.length > 0) {
          // make sure the target is actually contained in a group
          // NOTE: the target may also be the container itself if it's focusable
          //  with tabIndex='-1' and was given initial focus
          var containerIndex = findContainerIndex(target);
          var containerGroup = containerIndex >= 0 ? state.containerGroups[containerIndex] : undefined;

          if (containerIndex < 0) {
            // target not found in any group: quite possible focus has escaped the trap,
            //  so bring it back in to...
            if (e.shiftKey) {
              // ...the last node in the last group
              destinationNode = state.tabbableGroups[state.tabbableGroups.length - 1].lastTabbableNode;
            } else {
              // ...the first node in the first group
              destinationNode = state.tabbableGroups[0].firstTabbableNode;
            }
          } else if (e.shiftKey) {
            // REVERSE
            // is the target the first tabbable node in a group?
            var startOfGroupIndex = findIndex(state.tabbableGroups, function (_ref2) {
              var firstTabbableNode = _ref2.firstTabbableNode;
              return target === firstTabbableNode;
            });

            if (startOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target, config.tabbableOptions) && !isTabbable(target, config.tabbableOptions) && !containerGroup.nextTabbableNode(target, false))) {
              // an exception case where the target is either the container itself, or
              //  a non-tabbable node that was given focus (i.e. tabindex is negative
              //  and user clicked on it or node was programmatically given focus)
              //  and is not followed by any other tabbable node, in which
              //  case, we should handle shift+tab as if focus were on the container's
              //  first tabbable node, and go to the last tabbable node of the LAST group
              startOfGroupIndex = containerIndex;
            }

            if (startOfGroupIndex >= 0) {
              // YES: then shift+tab should go to the last tabbable node in the
              //  previous group (and wrap around to the last tabbable node of
              //  the LAST group if it's the first tabbable node of the FIRST group)
              var destinationGroupIndex = startOfGroupIndex === 0 ? state.tabbableGroups.length - 1 : startOfGroupIndex - 1;
              var destinationGroup = state.tabbableGroups[destinationGroupIndex];
              destinationNode = destinationGroup.lastTabbableNode;
            }
          } else {
            // FORWARD
            // is the target the last tabbable node in a group?
            var lastOfGroupIndex = findIndex(state.tabbableGroups, function (_ref3) {
              var lastTabbableNode = _ref3.lastTabbableNode;
              return target === lastTabbableNode;
            });

            if (lastOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target, config.tabbableOptions) && !isTabbable(target, config.tabbableOptions) && !containerGroup.nextTabbableNode(target))) {
              // an exception case where the target is the container itself, or
              //  a non-tabbable node that was given focus (i.e. tabindex is negative
              //  and user clicked on it or node was programmatically given focus)
              //  and is not followed by any other tabbable node, in which
              //  case, we should handle tab as if focus were on the container's
              //  last tabbable node, and go to the first tabbable node of the FIRST group
              lastOfGroupIndex = containerIndex;
            }

            if (lastOfGroupIndex >= 0) {
              // YES: then tab should go to the first tabbable node in the next
              //  group (and wrap around to the first tabbable node of the FIRST
              //  group if it's the last tabbable node of the LAST group)
              var _destinationGroupIndex = lastOfGroupIndex === state.tabbableGroups.length - 1 ? 0 : lastOfGroupIndex + 1;

              var _destinationGroup = state.tabbableGroups[_destinationGroupIndex];
              destinationNode = _destinationGroup.firstTabbableNode;
            }
          }
        } else {
          // NOTE: the fallbackFocus option does not support returning false to opt-out
          destinationNode = getNodeForOption('fallbackFocus');
        }

        if (destinationNode) {
          e.preventDefault();
          tryFocus(destinationNode);
        } // else, let the browser take care of [shift+]tab and move the focus

      };

      var checkKey = function checkKey(e) {
        if (isEscapeEvent(e) && valueOrHandler(config.escapeDeactivates, e) !== false) {
          e.preventDefault();
          trap.deactivate();
          return;
        }

        if (isTabEvent(e)) {
          checkTab(e);
          return;
        }
      };

      var checkClick = function checkClick(e) {
        var target = getActualTarget(e);

        if (findContainerIndex(target) >= 0) {
          return;
        }

        if (valueOrHandler(config.clickOutsideDeactivates, e)) {
          return;
        }

        if (valueOrHandler(config.allowOutsideClick, e)) {
          return;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
      }; //
      // EVENT LISTENERS
      //


      var addListeners = function addListeners() {
        if (!state.active) {
          return;
        } // There can be only one listening focus trap at a time


        activeFocusTraps.activateTrap(trap); // Delay ensures that the focused element doesn't capture the event
        // that caused the focus trap activation.

        state.delayInitialFocusTimer = config.delayInitialFocus ? delay(function () {
          tryFocus(getInitialFocusNode());
        }) : tryFocus(getInitialFocusNode());
        doc.addEventListener('focusin', checkFocusIn, true);
        doc.addEventListener('mousedown', checkPointerDown, {
          capture: true,
          passive: false
        });
        doc.addEventListener('touchstart', checkPointerDown, {
          capture: true,
          passive: false
        });
        doc.addEventListener('click', checkClick, {
          capture: true,
          passive: false
        });
        doc.addEventListener('keydown', checkKey, {
          capture: true,
          passive: false
        });
        return trap;
      };

      var removeListeners = function removeListeners() {
        if (!state.active) {
          return;
        }

        doc.removeEventListener('focusin', checkFocusIn, true);
        doc.removeEventListener('mousedown', checkPointerDown, true);
        doc.removeEventListener('touchstart', checkPointerDown, true);
        doc.removeEventListener('click', checkClick, true);
        doc.removeEventListener('keydown', checkKey, true);
        return trap;
      }; //
      // TRAP DEFINITION
      //


      trap = {
        get active() {
          return state.active;
        },

        get paused() {
          return state.paused;
        },

        activate: function activate(activateOptions) {
          if (state.active) {
            return this;
          }

          var onActivate = getOption(activateOptions, 'onActivate');
          var onPostActivate = getOption(activateOptions, 'onPostActivate');
          var checkCanFocusTrap = getOption(activateOptions, 'checkCanFocusTrap');

          if (!checkCanFocusTrap) {
            updateTabbableNodes();
          }

          state.active = true;
          state.paused = false;
          state.nodeFocusedBeforeActivation = doc.activeElement;

          if (onActivate) {
            onActivate();
          }

          var finishActivation = function finishActivation() {
            if (checkCanFocusTrap) {
              updateTabbableNodes();
            }

            addListeners();

            if (onPostActivate) {
              onPostActivate();
            }
          };

          if (checkCanFocusTrap) {
            checkCanFocusTrap(state.containers.concat()).then(finishActivation, finishActivation);
            return this;
          }

          finishActivation();
          return this;
        },
        deactivate: function deactivate(deactivateOptions) {
          if (!state.active) {
            return this;
          }

          var options = _objectSpread2({
            onDeactivate: config.onDeactivate,
            onPostDeactivate: config.onPostDeactivate,
            checkCanReturnFocus: config.checkCanReturnFocus
          }, deactivateOptions);

          clearTimeout(state.delayInitialFocusTimer); // noop if undefined

          state.delayInitialFocusTimer = undefined;
          removeListeners();
          state.active = false;
          state.paused = false;
          activeFocusTraps.deactivateTrap(trap);
          var onDeactivate = getOption(options, 'onDeactivate');
          var onPostDeactivate = getOption(options, 'onPostDeactivate');
          var checkCanReturnFocus = getOption(options, 'checkCanReturnFocus');
          var returnFocus = getOption(options, 'returnFocus', 'returnFocusOnDeactivate');

          if (onDeactivate) {
            onDeactivate();
          }

          var finishDeactivation = function finishDeactivation() {
            delay(function () {
              if (returnFocus) {
                tryFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation));
              }

              if (onPostDeactivate) {
                onPostDeactivate();
              }
            });
          };

          if (returnFocus && checkCanReturnFocus) {
            checkCanReturnFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation)).then(finishDeactivation, finishDeactivation);
            return this;
          }

          finishDeactivation();
          return this;
        },
        pause: function pause() {
          if (state.paused || !state.active) {
            return this;
          }

          state.paused = true;
          removeListeners();
          return this;
        },
        unpause: function unpause() {
          if (!state.paused || !state.active) {
            return this;
          }

          state.paused = false;
          updateTabbableNodes();
          addListeners();
          return this;
        },
        updateContainerElements: function updateContainerElements(containerElements) {
          var elementsAsArray = [].concat(containerElements).filter(Boolean);
          state.containers = elementsAsArray.map(function (element) {
            return typeof element === 'string' ? doc.querySelector(element) : element;
          });

          if (state.active) {
            updateTabbableNodes();
          }

          return this;
        }
      }; // initialize container elements

      trap.updateContainerElements(elements);
      return trap;
    };

    /* node_modules\fluent-svelte\Flyout\FlyoutSurface.svelte generated by Svelte v3.48.0 */
    const file$6 = "node_modules\\fluent-svelte\\Flyout\\FlyoutSurface.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	let div_levels = [
    		{
    			class: div_class_value = "flyout " + /*className*/ ctx[1]
    		},
    		/*$$restProps*/ ctx[3]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			toggle_class(div, "svelte-zbytle", true);
    			add_location(div, file$6, 10, 0, 399);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[6](div);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*forwardEvents*/ ctx[2].call(null, div));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className*/ 2 && div_class_value !== (div_class_value = "flyout " + /*className*/ ctx[1])) && { class: div_class_value },
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));

    			toggle_class(div, "svelte-zbytle", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[6](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const omit_props_names = ["class","element"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FlyoutSurface', slots, ['default']);
    	let { class: className = "" } = $$props;
    	let { element = null } = $$props;
    	const forwardEvents = createEventForwarder(get_current_component());

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('element' in $$new_props) $$invalidate(0, element = $$new_props.element);
    		if ('$$scope' in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		createEventForwarder,
    		className,
    		element,
    		forwardEvents
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(1, className = $$new_props.className);
    		if ('element' in $$props) $$invalidate(0, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [element, className, forwardEvents, $$restProps, $$scope, slots, div_binding];
    }

    class FlyoutSurface extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { class: 1, element: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FlyoutSurface",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<FlyoutSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<FlyoutSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get element() {
    		throw new Error("<FlyoutSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<FlyoutSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\fluent-svelte\Tooltip\TooltipSurface.svelte generated by Svelte v3.48.0 */
    const file$5 = "node_modules\\fluent-svelte\\Tooltip\\TooltipSurface.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	let div_levels = [
    		{
    			class: div_class_value = "tooltip " + /*className*/ ctx[1]
    		},
    		{ role: "tooltip" },
    		/*$$restProps*/ ctx[3]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			toggle_class(div, "svelte-gc7m6k", true);
    			add_location(div, file$5, 10, 0, 399);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[6](div);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*forwardEvents*/ ctx[2].call(null, div));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className*/ 2 && div_class_value !== (div_class_value = "tooltip " + /*className*/ ctx[1])) && { class: div_class_value },
    				{ role: "tooltip" },
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));

    			toggle_class(div, "svelte-gc7m6k", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[6](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const omit_props_names = ["class","element"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TooltipSurface', slots, ['default']);
    	let { class: className = "" } = $$props;
    	let { element = null } = $$props;
    	const forwardEvents = createEventForwarder(get_current_component());

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('element' in $$new_props) $$invalidate(0, element = $$new_props.element);
    		if ('$$scope' in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventForwarder,
    		get_current_component,
    		className,
    		element,
    		forwardEvents
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(1, className = $$new_props.className);
    		if ('element' in $$props) $$invalidate(0, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [element, className, forwardEvents, $$restProps, $$scope, slots, div_binding];
    }

    class TooltipSurface extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { class: 1, element: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TooltipSurface",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<TooltipSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TooltipSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get element() {
    		throw new Error("<TooltipSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<TooltipSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Basic wrapper action around focus-trap
    function focusTrap(node, options) {
        const trap = createFocusTrap(node, (options = { ...options, fallbackFocus: node }));
        trap.activate();
        return {
            destroy() {
                trap.deactivate();
            }
        };
    }
    // ID generator for handling WAI-ARIA related attributes
    function uid(prefix) {
        return (prefix +
            String.fromCharCode(Math.floor(Math.random() * 26) + 97) +
            Math.random().toString(16).slice(2) +
            Date.now().toString(16).split(".")[0]);
    }
    // Returns a number representing the duration of a specified CSS custom property in ms
    function getCSSDuration(property) {
        const duration = window.getComputedStyle(document.documentElement).getPropertyValue(property);
        return parseFloat(duration) * (/\ds$/.test(duration) ? 1000 : 1) || 0;
    }
    // Function for forwarding DOM events to the component's declaration
    // Adapted from rgossiaux/svelte-headlessui which is modified from hperrin/svelte-material-ui
    function createEventForwarder(component, exclude = []) {
        // This is our pseudo $on function. It is defined on component mount.
        let $on;
        // This is a list of events bound before mount.
        let events = [];
        // Monkeypatch SvelteComponent.$on with our own forward-compatible version
        component.$on = (eventType, callback) => {
            let destructor = () => { };
            if (exclude.includes(eventType)) {
                // Bail out of the event forwarding and run the normal Svelte $on() code
                const callbacks = component.$$.callbacks[eventType] || (component.$$.callbacks[eventType] = []);
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            if ($on) {
                destructor = $on(eventType, callback); // The event was bound programmatically.
            }
            else {
                events.push([eventType, callback]); // The event was bound before mount by Svelte.
            }
            return () => destructor();
        };
        return (node) => {
            const destructors = [];
            const forwardDestructors = {};
            const forward = (e) => bubble(component, e);
            // This function is responsible for listening and forwarding
            // all bound events.
            $on = (eventType, callback) => {
                let handler = callback;
                // DOM addEventListener options argument.
                let options = false;
                // Listen for the event directly, with the given options.
                const off = listen(node, eventType, handler, options);
                const destructor = () => {
                    off();
                    const idx = destructors.indexOf(destructor);
                    if (idx > -1) {
                        destructors.splice(idx, 1);
                    }
                };
                destructors.push(destructor);
                // Forward the event from Svelte.
                if (!(eventType in forwardDestructors)) {
                    forwardDestructors[eventType] = listen(node, eventType, forward);
                }
                return destructor;
            };
            // Listen to all the events added before mount.
            for (const event of events) {
                $on(event[0], event[1]);
            }
            return {
                destroy: () => {
                    // Remove all event listeners.
                    for (const destructor of destructors) {
                        destructor();
                    }
                    // Remove all event forwarders.
                    for (let entry of Object.entries(forwardDestructors)) {
                        entry[1]();
                    }
                }
            };
        };
    }

    /* node_modules\fluent-svelte\Button\Button.svelte generated by Svelte v3.48.0 */
    const file$4 = "node_modules\\fluent-svelte\\Button\\Button.svelte";

    // (38:0) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	let button_levels = [
    		{
    			class: button_class_value = "button style-" + /*variant*/ ctx[1] + " " + /*className*/ ctx[4]
    		},
    		{ disabled: /*disabled*/ ctx[3] },
    		/*$$restProps*/ ctx[6]
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			toggle_class(button, "disabled", /*disabled*/ ctx[3]);
    			toggle_class(button, "svelte-1ulhukx", true);
    			add_location(button, file$4, 38, 1, 1270);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (button.autofocus) button.focus();
    			/*button_binding*/ ctx[10](button);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*forwardEvents*/ ctx[5].call(null, button));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty & /*variant, className*/ 18 && button_class_value !== (button_class_value = "button style-" + /*variant*/ ctx[1] + " " + /*className*/ ctx[4])) && { class: button_class_value },
    				(!current || dirty & /*disabled*/ 8) && { disabled: /*disabled*/ ctx[3] },
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));

    			toggle_class(button, "disabled", /*disabled*/ ctx[3]);
    			toggle_class(button, "svelte-1ulhukx", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			/*button_binding*/ ctx[10](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(38:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (26:0) {#if href && !disabled}
    function create_if_block$4(ctx) {
    	let a;
    	let a_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	let a_levels = [
    		{ role: "button" },
    		{
    			class: a_class_value = "button style-" + /*variant*/ ctx[1] + " " + /*className*/ ctx[4]
    		},
    		{ href: /*href*/ ctx[2] },
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			toggle_class(a, "disabled", /*disabled*/ ctx[3]);
    			toggle_class(a, "svelte-1ulhukx", true);
    			add_location(a, file$4, 26, 1, 1090);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			/*a_binding*/ ctx[9](a);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*forwardEvents*/ ctx[5].call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				{ role: "button" },
    				(!current || dirty & /*variant, className*/ 18 && a_class_value !== (a_class_value = "button style-" + /*variant*/ ctx[1] + " " + /*className*/ ctx[4])) && { class: a_class_value },
    				(!current || dirty & /*href*/ 4) && { href: /*href*/ ctx[2] },
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));

    			toggle_class(a, "disabled", /*disabled*/ ctx[3]);
    			toggle_class(a, "svelte-1ulhukx", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			/*a_binding*/ ctx[9](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(26:0) {#if href && !disabled}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[2] && !/*disabled*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const omit_props_names = ["variant","href","disabled","class","element"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { variant = "standard" } = $$props;
    	let { href = "" } = $$props;
    	let { disabled = false } = $$props;
    	let { class: className = "" } = $$props;
    	let { element = null } = $$props;
    	const forwardEvents = createEventForwarder(get_current_component());

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('variant' in $$new_props) $$invalidate(1, variant = $$new_props.variant);
    		if ('href' in $$new_props) $$invalidate(2, href = $$new_props.href);
    		if ('disabled' in $$new_props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ('class' in $$new_props) $$invalidate(4, className = $$new_props.class);
    		if ('element' in $$new_props) $$invalidate(0, element = $$new_props.element);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		createEventForwarder,
    		variant,
    		href,
    		disabled,
    		className,
    		element,
    		forwardEvents
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('variant' in $$props) $$invalidate(1, variant = $$new_props.variant);
    		if ('href' in $$props) $$invalidate(2, href = $$new_props.href);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ('className' in $$props) $$invalidate(4, className = $$new_props.className);
    		if ('element' in $$props) $$invalidate(0, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		element,
    		variant,
    		href,
    		disabled,
    		className,
    		forwardEvents,
    		$$restProps,
    		$$scope,
    		slots,
    		a_binding,
    		button_binding
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			variant: 1,
    			href: 2,
    			disabled: 3,
    			class: 4,
    			element: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get variant() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get element() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\fluent-svelte\RadioButton\RadioButton.svelte generated by Svelte v3.48.0 */
    const file$3 = "node_modules\\fluent-svelte\\RadioButton\\RadioButton.svelte";

    // (49:1) {#if $$slots.default}
    function create_if_block$3(ctx) {
    	let span;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "svelte-hhkzib");
    			add_location(span, file$3, 49, 2, 2035);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(49:1) {#if $$slots.default}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let label;
    	let input;
    	let input_class_value;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		{ type: "radio" },
    		{
    			class: input_class_value = "radio-button " + /*className*/ ctx[6]
    		},
    		{ __value: /*value*/ ctx[4] },
    		{ checked: /*checked*/ ctx[3] },
    		{ disabled: /*disabled*/ ctx[5] },
    		/*$$restProps*/ ctx[8]
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	let if_block = /*$$slots*/ ctx[9].default && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			set_attributes(input, input_data);
    			/*$$binding_groups*/ ctx[13][0].push(input);
    			toggle_class(input, "svelte-hhkzib", true);
    			add_location(input, file$3, 37, 1, 1835);
    			attr_dev(label, "class", "radio-button-container svelte-hhkzib");
    			add_location(label, file$3, 36, 0, 1766);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			if (input.autofocus) input.focus();
    			input.checked = input.__value === /*group*/ ctx[0];
    			/*input_binding*/ ctx[14](input);
    			append_dev(label, t);
    			if (if_block) if_block.m(label, null);
    			/*label_binding*/ ctx[15](label);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*forwardEvents*/ ctx[7].call(null, input)),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				{ type: "radio" },
    				(!current || dirty & /*className*/ 64 && input_class_value !== (input_class_value = "radio-button " + /*className*/ ctx[6])) && { class: input_class_value },
    				(!current || dirty & /*value*/ 16) && { __value: /*value*/ ctx[4] },
    				(!current || dirty & /*checked*/ 8) && { checked: /*checked*/ ctx[3] },
    				(!current || dirty & /*disabled*/ 32) && { disabled: /*disabled*/ ctx[5] },
    				dirty & /*$$restProps*/ 256 && /*$$restProps*/ ctx[8]
    			]));

    			if (dirty & /*group*/ 1) {
    				input.checked = input.__value === /*group*/ ctx[0];
    			}

    			toggle_class(input, "svelte-hhkzib", true);

    			if (/*$$slots*/ ctx[9].default) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$$slots*/ 512) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(label, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[13][0].splice(/*$$binding_groups*/ ctx[13][0].indexOf(input), 1);
    			/*input_binding*/ ctx[14](null);
    			if (if_block) if_block.d();
    			/*label_binding*/ ctx[15](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const omit_props_names = ["group","checked","value","disabled","class","inputElement","containerElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RadioButton', slots, ['default']);
    	const $$slots = compute_slots(slots);
    	let { group = undefined } = $$props;
    	let { checked = false } = $$props;
    	let { value = undefined } = $$props;
    	let { disabled = false } = $$props;
    	let { class: className = "" } = $$props;
    	let { inputElement = null } = $$props;
    	let { containerElement = null } = $$props;
    	const forwardEvents = createEventForwarder(get_current_component());
    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		group = this.__value;
    		$$invalidate(0, group);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputElement = $$value;
    			$$invalidate(1, inputElement);
    		});
    	}

    	function label_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			containerElement = $$value;
    			$$invalidate(2, containerElement);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(8, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('group' in $$new_props) $$invalidate(0, group = $$new_props.group);
    		if ('checked' in $$new_props) $$invalidate(3, checked = $$new_props.checked);
    		if ('value' in $$new_props) $$invalidate(4, value = $$new_props.value);
    		if ('disabled' in $$new_props) $$invalidate(5, disabled = $$new_props.disabled);
    		if ('class' in $$new_props) $$invalidate(6, className = $$new_props.class);
    		if ('inputElement' in $$new_props) $$invalidate(1, inputElement = $$new_props.inputElement);
    		if ('containerElement' in $$new_props) $$invalidate(2, containerElement = $$new_props.containerElement);
    		if ('$$scope' in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		createEventForwarder,
    		group,
    		checked,
    		value,
    		disabled,
    		className,
    		inputElement,
    		containerElement,
    		forwardEvents
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('group' in $$props) $$invalidate(0, group = $$new_props.group);
    		if ('checked' in $$props) $$invalidate(3, checked = $$new_props.checked);
    		if ('value' in $$props) $$invalidate(4, value = $$new_props.value);
    		if ('disabled' in $$props) $$invalidate(5, disabled = $$new_props.disabled);
    		if ('className' in $$props) $$invalidate(6, className = $$new_props.className);
    		if ('inputElement' in $$props) $$invalidate(1, inputElement = $$new_props.inputElement);
    		if ('containerElement' in $$props) $$invalidate(2, containerElement = $$new_props.containerElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		group,
    		inputElement,
    		containerElement,
    		checked,
    		value,
    		disabled,
    		className,
    		forwardEvents,
    		$$restProps,
    		$$slots,
    		$$scope,
    		slots,
    		input_change_handler,
    		$$binding_groups,
    		input_binding,
    		label_binding
    	];
    }

    class RadioButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			group: 0,
    			checked: 3,
    			value: 4,
    			disabled: 5,
    			class: 6,
    			inputElement: 1,
    			containerElement: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RadioButton",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get group() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputElement() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputElement(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerElement() {
    		throw new Error("<RadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerElement(value) {
    		throw new Error("<RadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function circOut(t) {
        return Math.sqrt(1 - --t * t);
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules\fluent-svelte\Flyout\FlyoutWrapper.svelte generated by Svelte v3.48.0 */
    const file$2 = "node_modules\\fluent-svelte\\Flyout\\FlyoutWrapper.svelte";
    const get_flyout_slot_changes = dirty => ({});
    const get_flyout_slot_context = ctx => ({});
    const get_override_slot_changes = dirty => ({});
    const get_override_slot_context = ctx => ({});

    // (80:1) {#if open}
    function create_if_block$2(ctx) {
    	let div0;
    	let div0_class_value;
    	let div0_style_value;
    	let div0_outro;
    	let t;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;
    	const override_slot_template = /*#slots*/ ctx[17].override;
    	const override_slot = create_slot(override_slot_template, ctx, /*$$scope*/ ctx[23], get_override_slot_context);
    	const override_slot_or_fallback = override_slot || fallback_block$1(ctx);

    	let div0_levels = [
    		{ id: /*menuId*/ ctx[10] },
    		{
    			class: div0_class_value = "flyout-anchor placement-" + /*placement*/ ctx[5] + " alignment-" + /*alignment*/ ctx[6]
    		},
    		{
    			style: div0_style_value = "--fds-flyout-offset: " + /*offset*/ ctx[7] + "px;"
    		},
    		/*$$restProps*/ ctx[14]
    	];

    	let div0_data = {};

    	for (let i = 0; i < div0_levels.length; i += 1) {
    		div0_data = assign(div0_data, div0_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if (override_slot_or_fallback) override_slot_or_fallback.c();
    			t = space();
    			div1 = element("div");
    			set_attributes(div0, div0_data);
    			toggle_class(div0, "svelte-14i765b", true);
    			add_location(div0, file$2, 80, 2, 2725);
    			attr_dev(div1, "class", "flyout-backdrop svelte-14i765b");
    			add_location(div1, file$2, 99, 2, 3222);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			if (override_slot_or_fallback) {
    				override_slot_or_fallback.m(div0, null);
    			}

    			/*div0_binding*/ ctx[19](div0);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			/*div1_binding*/ ctx[20](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*_focusTrap*/ ctx[9].call(null, div0)),
    					listen_dev(div0, "click", click_handler, false, false, false),
    					listen_dev(div1, "click", click_handler_1, false, false, false),
    					listen_dev(div1, "mousedown", /*closeFlyout*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (override_slot) {
    				if (override_slot.p && (!current || dirty & /*$$scope*/ 8388608)) {
    					update_slot_base(
    						override_slot,
    						override_slot_template,
    						ctx,
    						/*$$scope*/ ctx[23],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[23])
    						: get_slot_changes(override_slot_template, /*$$scope*/ ctx[23], dirty, get_override_slot_changes),
    						get_override_slot_context
    					);
    				}
    			} else {
    				if (override_slot_or_fallback && override_slot_or_fallback.p && (!current || dirty & /*menuElement, $$scope*/ 8388616)) {
    					override_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			set_attributes(div0, div0_data = get_spread_update(div0_levels, [
    				{ id: /*menuId*/ ctx[10] },
    				(!current || dirty & /*placement, alignment*/ 96 && div0_class_value !== (div0_class_value = "flyout-anchor placement-" + /*placement*/ ctx[5] + " alignment-" + /*alignment*/ ctx[6])) && { class: div0_class_value },
    				(!current || dirty & /*offset*/ 128 && div0_style_value !== (div0_style_value = "--fds-flyout-offset: " + /*offset*/ ctx[7] + "px;")) && { style: div0_style_value },
    				dirty & /*$$restProps*/ 16384 && /*$$restProps*/ ctx[14]
    			]));

    			toggle_class(div0, "svelte-14i765b", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(override_slot_or_fallback, local);
    			if (div0_outro) div0_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(override_slot_or_fallback, local);

    			if (local) {
    				div0_outro = create_out_transition(div0, fade, {
    					duration: getCSSDuration("--fds-control-faster-duration"),
    					easing: circOut
    				});
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (override_slot_or_fallback) override_slot_or_fallback.d(detaching);
    			/*div0_binding*/ ctx[19](null);
    			if (detaching && div0_outro) div0_outro.end();
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			/*div1_binding*/ ctx[20](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(80:1) {#if open}",
    		ctx
    	});

    	return block;
    }

    // (95:4) <FlyoutSurface bind:element={menuElement}>
    function create_default_slot$2(ctx) {
    	let current;
    	const flyout_slot_template = /*#slots*/ ctx[17].flyout;
    	const flyout_slot = create_slot(flyout_slot_template, ctx, /*$$scope*/ ctx[23], get_flyout_slot_context);

    	const block = {
    		c: function create() {
    			if (flyout_slot) flyout_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (flyout_slot) {
    				flyout_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (flyout_slot) {
    				if (flyout_slot.p && (!current || dirty & /*$$scope*/ 8388608)) {
    					update_slot_base(
    						flyout_slot,
    						flyout_slot_template,
    						ctx,
    						/*$$scope*/ ctx[23],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[23])
    						: get_slot_changes(flyout_slot_template, /*$$scope*/ ctx[23], dirty, get_flyout_slot_changes),
    						get_flyout_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flyout_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flyout_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (flyout_slot) flyout_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(95:4) <FlyoutSurface bind:element={menuElement}>",
    		ctx
    	});

    	return block;
    }

    // (94:25)      
    function fallback_block$1(ctx) {
    	let flyoutsurface;
    	let updating_element;
    	let current;

    	function flyoutsurface_element_binding(value) {
    		/*flyoutsurface_element_binding*/ ctx[18](value);
    	}

    	let flyoutsurface_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	if (/*menuElement*/ ctx[3] !== void 0) {
    		flyoutsurface_props.element = /*menuElement*/ ctx[3];
    	}

    	flyoutsurface = new FlyoutSurface({
    			props: flyoutsurface_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(flyoutsurface, 'element', flyoutsurface_element_binding));

    	const block = {
    		c: function create() {
    			create_component(flyoutsurface.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(flyoutsurface, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const flyoutsurface_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				flyoutsurface_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_element && dirty & /*menuElement*/ 8) {
    				updating_element = true;
    				flyoutsurface_changes.element = /*menuElement*/ ctx[3];
    				add_flush_callback(() => updating_element = false);
    			}

    			flyoutsurface.$set(flyoutsurface_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flyoutsurface.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flyoutsurface.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(flyoutsurface, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(94:25)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[23], null);
    	let if_block = /*open*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", div_class_value = "flyout-wrapper " + /*className*/ ctx[8] + " svelte-14i765b");
    			attr_dev(div, "aria-expanded", /*open*/ ctx[0]);
    			attr_dev(div, "aria-haspopup", /*open*/ ctx[0]);
    			attr_dev(div, "aria-controls", /*menuId*/ ctx[10]);
    			add_location(div, file$2, 69, 0, 2501);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			/*div_binding*/ ctx[22](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*handleEscapeKey*/ ctx[11], false, false, false),
    					listen_dev(div, "click", /*click_handler_2*/ ctx[21], false, false, false),
    					listen_dev(div, "keydown", /*handleKeyDown*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8388608)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[23],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[23])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[23], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*className*/ 256 && div_class_value !== (div_class_value = "flyout-wrapper " + /*className*/ ctx[8] + " svelte-14i765b")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*open*/ 1) {
    				attr_dev(div, "aria-expanded", /*open*/ ctx[0]);
    			}

    			if (!current || dirty & /*open*/ 1) {
    				attr_dev(div, "aria-haspopup", /*open*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d();
    			/*div_binding*/ ctx[22](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const click_handler = e => e.stopPropagation();
    const click_handler_1 = e => e.stopPropagation();

    function instance$2($$self, $$props, $$invalidate) {
    	let _focusTrap;

    	const omit_props_names = [
    		"open","closable","placement","alignment","offset","trapFocus","class","wrapperElement","anchorElement","menuElement","backdropElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FlyoutWrapper', slots, ['default','flyout','override']);
    	let { open = false } = $$props;
    	let { closable = true } = $$props;
    	let { placement = "top" } = $$props;
    	let { alignment = "center" } = $$props;
    	let { offset = 4 } = $$props;
    	let { trapFocus = true } = $$props;
    	let { class: className = "" } = $$props;
    	let { wrapperElement = null } = $$props;
    	let { anchorElement = null } = $$props;
    	let { menuElement = null } = $$props;
    	let { backdropElement = null } = $$props;
    	const dispatch = createEventDispatcher();
    	const menuId = uid("fds-flyout-anchor-");

    	function handleEscapeKey({ key }) {
    		if (key === "Escape" && closable) $$invalidate(0, open = false);
    	}

    	function closeFlyout() {
    		if (closable) $$invalidate(0, open = false);
    	}

    	function handleKeyDown(event) {
    		if (event.key === " " || event.key === "Enter") {
    			event.preventDefault();
    			$$invalidate(0, open = !open);
    		}
    	}

    	function flyoutsurface_element_binding(value) {
    		menuElement = value;
    		$$invalidate(3, menuElement);
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			anchorElement = $$value;
    			$$invalidate(2, anchorElement);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			backdropElement = $$value;
    			$$invalidate(4, backdropElement);
    		});
    	}

    	const click_handler_2 = () => $$invalidate(0, open = !open);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			wrapperElement = $$value;
    			$$invalidate(1, wrapperElement);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(14, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('open' in $$new_props) $$invalidate(0, open = $$new_props.open);
    		if ('closable' in $$new_props) $$invalidate(15, closable = $$new_props.closable);
    		if ('placement' in $$new_props) $$invalidate(5, placement = $$new_props.placement);
    		if ('alignment' in $$new_props) $$invalidate(6, alignment = $$new_props.alignment);
    		if ('offset' in $$new_props) $$invalidate(7, offset = $$new_props.offset);
    		if ('trapFocus' in $$new_props) $$invalidate(16, trapFocus = $$new_props.trapFocus);
    		if ('class' in $$new_props) $$invalidate(8, className = $$new_props.class);
    		if ('wrapperElement' in $$new_props) $$invalidate(1, wrapperElement = $$new_props.wrapperElement);
    		if ('anchorElement' in $$new_props) $$invalidate(2, anchorElement = $$new_props.anchorElement);
    		if ('menuElement' in $$new_props) $$invalidate(3, menuElement = $$new_props.menuElement);
    		if ('backdropElement' in $$new_props) $$invalidate(4, backdropElement = $$new_props.backdropElement);
    		if ('$$scope' in $$new_props) $$invalidate(23, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		uid,
    		focusTrap,
    		getCSSDuration,
    		fade,
    		circOut,
    		FlyoutSurface,
    		open,
    		closable,
    		placement,
    		alignment,
    		offset,
    		trapFocus,
    		className,
    		wrapperElement,
    		anchorElement,
    		menuElement,
    		backdropElement,
    		dispatch,
    		menuId,
    		handleEscapeKey,
    		closeFlyout,
    		handleKeyDown,
    		_focusTrap
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('open' in $$props) $$invalidate(0, open = $$new_props.open);
    		if ('closable' in $$props) $$invalidate(15, closable = $$new_props.closable);
    		if ('placement' in $$props) $$invalidate(5, placement = $$new_props.placement);
    		if ('alignment' in $$props) $$invalidate(6, alignment = $$new_props.alignment);
    		if ('offset' in $$props) $$invalidate(7, offset = $$new_props.offset);
    		if ('trapFocus' in $$props) $$invalidate(16, trapFocus = $$new_props.trapFocus);
    		if ('className' in $$props) $$invalidate(8, className = $$new_props.className);
    		if ('wrapperElement' in $$props) $$invalidate(1, wrapperElement = $$new_props.wrapperElement);
    		if ('anchorElement' in $$props) $$invalidate(2, anchorElement = $$new_props.anchorElement);
    		if ('menuElement' in $$props) $$invalidate(3, menuElement = $$new_props.menuElement);
    		if ('backdropElement' in $$props) $$invalidate(4, backdropElement = $$new_props.backdropElement);
    		if ('_focusTrap' in $$props) $$invalidate(9, _focusTrap = $$new_props._focusTrap);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*trapFocus*/ 65536) {
    			$$invalidate(9, _focusTrap = trapFocus
    			? focusTrap
    			: () => {
    					
    				});
    		}

    		if ($$self.$$.dirty & /*open*/ 1) {
    			if (open) {
    				dispatch("open");
    			} else {
    				dispatch("close");
    			}
    		}
    	};

    	return [
    		open,
    		wrapperElement,
    		anchorElement,
    		menuElement,
    		backdropElement,
    		placement,
    		alignment,
    		offset,
    		className,
    		_focusTrap,
    		menuId,
    		handleEscapeKey,
    		closeFlyout,
    		handleKeyDown,
    		$$restProps,
    		closable,
    		trapFocus,
    		slots,
    		flyoutsurface_element_binding,
    		div0_binding,
    		div1_binding,
    		click_handler_2,
    		div_binding,
    		$$scope
    	];
    }

    class FlyoutWrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			open: 0,
    			closable: 15,
    			placement: 5,
    			alignment: 6,
    			offset: 7,
    			trapFocus: 16,
    			class: 8,
    			wrapperElement: 1,
    			anchorElement: 2,
    			menuElement: 3,
    			backdropElement: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FlyoutWrapper",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get open() {
    		throw new Error("<FlyoutWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<FlyoutWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closable() {
    		throw new Error("<FlyoutWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closable(value) {
    		throw new Error("<FlyoutWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placement() {
    		throw new Error("<FlyoutWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placement(value) {
    		throw new Error("<FlyoutWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alignment() {
    		throw new Error("<FlyoutWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alignment(value) {
    		throw new Error("<FlyoutWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset() {
    		throw new Error("<FlyoutWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<FlyoutWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get trapFocus() {
    		throw new Error("<FlyoutWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trapFocus(value) {
    		throw new Error("<FlyoutWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<FlyoutWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<FlyoutWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapperElement() {
    		throw new Error("<FlyoutWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapperElement(value) {
    		throw new Error("<FlyoutWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchorElement() {
    		throw new Error("<FlyoutWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchorElement(value) {
    		throw new Error("<FlyoutWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get menuElement() {
    		throw new Error("<FlyoutWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuElement(value) {
    		throw new Error("<FlyoutWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backdropElement() {
    		throw new Error("<FlyoutWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backdropElement(value) {
    		throw new Error("<FlyoutWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\fluent-svelte\Slider\Slider.svelte generated by Svelte v3.48.0 */

    const { window: window_1 } = globals;
    const file$1 = "node_modules\\fluent-svelte\\Slider\\Slider.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[46] = list[i];
    	return child_ctx;
    }

    const get_tooltip_slot_changes = dirty => ({
    	prefix: dirty[0] & /*prefix*/ 8192,
    	suffix: dirty[0] & /*suffix*/ 16384,
    	value: dirty[0] & /*value*/ 1
    });

    const get_tooltip_slot_context = ctx => ({
    	prefix: /*prefix*/ ctx[13],
    	suffix: /*suffix*/ ctx[14],
    	value: /*value*/ ctx[0]
    });

    // (200:2) {#if tooltip && !disabled}
    function create_if_block_2$1(ctx) {
    	let tooltipsurface;
    	let current;

    	tooltipsurface = new TooltipSurface({
    			props: {
    				class: "slider-tooltip",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tooltipsurface.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tooltipsurface, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tooltipsurface_changes = {};

    			if (dirty[0] & /*suffix, value, prefix*/ 24577 | dirty[1] & /*$$scope*/ 4096) {
    				tooltipsurface_changes.$$scope = { dirty, ctx };
    			}

    			tooltipsurface.$set(tooltipsurface_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltipsurface.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltipsurface.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tooltipsurface, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(200:2) {#if tooltip && !disabled}",
    		ctx
    	});

    	return block;
    }

    // (202:51)       
    function fallback_block(ctx) {
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text(/*prefix*/ ctx[13]);
    			t1 = text(/*value*/ ctx[0]);
    			t2 = text(/*suffix*/ ctx[14]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*prefix*/ 8192) set_data_dev(t0, /*prefix*/ ctx[13]);
    			if (dirty[0] & /*value*/ 1) set_data_dev(t1, /*value*/ ctx[0]);
    			if (dirty[0] & /*suffix*/ 16384) set_data_dev(t2, /*suffix*/ ctx[14]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(202:51)       ",
    		ctx
    	});

    	return block;
    }

    // (201:3) <TooltipSurface class="slider-tooltip">
    function create_default_slot$1(ctx) {
    	let current;
    	const tooltip_slot_template = /*#slots*/ ctx[34].tooltip;
    	const tooltip_slot = create_slot(tooltip_slot_template, ctx, /*$$scope*/ ctx[43], get_tooltip_slot_context);
    	const tooltip_slot_or_fallback = tooltip_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (tooltip_slot_or_fallback) tooltip_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (tooltip_slot_or_fallback) {
    				tooltip_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (tooltip_slot) {
    				if (tooltip_slot.p && (!current || dirty[0] & /*prefix, suffix, value*/ 24577 | dirty[1] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						tooltip_slot,
    						tooltip_slot_template,
    						ctx,
    						/*$$scope*/ ctx[43],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[43])
    						: get_slot_changes(tooltip_slot_template, /*$$scope*/ ctx[43], dirty, get_tooltip_slot_changes),
    						get_tooltip_slot_context
    					);
    				}
    			} else {
    				if (tooltip_slot_or_fallback && tooltip_slot_or_fallback.p && (!current || dirty[0] & /*suffix, value, prefix*/ 24577)) {
    					tooltip_slot_or_fallback.p(ctx, !current ? [-1, -1] : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (tooltip_slot_or_fallback) tooltip_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(201:3) <TooltipSurface class=\\\"slider-tooltip\\\">",
    		ctx
    	});

    	return block;
    }

    // (210:2) {#if track}
    function create_if_block_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "slider-track svelte-1ikqxku");
    			add_location(div, file$1, 210, 3, 6833);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[37](div);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[37](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(210:2) {#if track}",
    		ctx
    	});

    	return block;
    }

    // (215:1) {#if ticks}
    function create_if_block$1(ctx) {
    	let div;
    	let div_class_value;
    	let each_value = /*ticks*/ ctx[10];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", div_class_value = "slider-tick-bar placement-" + /*tickPlacement*/ ctx[11] + " svelte-1ikqxku");
    			add_location(div, file$1, 215, 2, 6919);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			/*div_binding_1*/ ctx[39](div);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*valueToPercentage, ticks*/ 33555456) {
    				each_value = /*ticks*/ ctx[10];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*tickPlacement*/ 2048 && div_class_value !== (div_class_value = "slider-tick-bar placement-" + /*tickPlacement*/ ctx[11] + " svelte-1ikqxku")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			/*div_binding_1*/ ctx[39](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(215:1) {#if ticks}",
    		ctx
    	});

    	return block;
    }

    // (217:3) {#each ticks as tick}
    function create_each_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "slider-tick svelte-1ikqxku");
    			set_style(div, "--fds-slider-tick-percentage", /*valueToPercentage*/ ctx[25](/*tick*/ ctx[46]) + "%");
    			add_location(div, file$1, 217, 4, 7031);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ticks*/ 1024) {
    				set_style(div, "--fds-slider-tick-percentage", /*valueToPercentage*/ ctx[25](/*tick*/ ctx[46]) + "%");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(217:3) {#each ticks as tick}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let div0_resize_listener;
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let input;
    	let div2_tabindex_value;
    	let div2_style_value;
    	let div2_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*tooltip*/ ctx[12] && !/*disabled*/ ctx[17] && create_if_block_2$1(ctx);
    	let if_block1 = /*track*/ ctx[15] && create_if_block_1$1(ctx);
    	let if_block2 = /*ticks*/ ctx[10] && create_if_block$1(ctx);

    	let div2_levels = [
    		{
    			tabindex: div2_tabindex_value = /*disabled*/ ctx[17] ? -1 : 0
    		},
    		{
    			style: div2_style_value = "--fds-slider-percentage: " + /*percentage*/ ctx[23] + "%; --fds-slider-thumb-offset: " + (/*thumbClientWidth*/ ctx[22] / 2 - linearScale([0, 50], [0, /*thumbClientWidth*/ ctx[22] / 2])(/*percentage*/ ctx[23])) + "px;"
    		},
    		{
    			class: div2_class_value = "slider orientation-" + /*orientation*/ ctx[16] + " " + /*className*/ ctx[18]
    		},
    		/*$$restProps*/ ctx[30]
    	];

    	let div2_data = {};

    	for (let i = 0; i < div2_levels.length; i += 1) {
    		div2_data = assign(div2_data, div2_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			input = element("input");
    			attr_dev(div0, "class", "slider-thumb svelte-1ikqxku");
    			attr_dev(div0, "role", "slider");
    			attr_dev(div0, "aria-valuemin", /*min*/ ctx[7]);
    			attr_dev(div0, "aria-valuemax", /*max*/ ctx[8]);
    			attr_dev(div0, "aria-valuenow", /*value*/ ctx[0]);
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[36].call(div0));
    			add_location(div0, file$1, 190, 1, 6382);
    			attr_dev(div1, "class", "slider-rail svelte-1ikqxku");
    			add_location(div1, file$1, 208, 1, 6766);
    			attr_dev(input, "type", "range");
    			input.hidden = true;
    			attr_dev(input, "min", /*min*/ ctx[7]);
    			attr_dev(input, "max", /*max*/ ctx[8]);
    			attr_dev(input, "step", /*step*/ ctx[9]);
    			input.disabled = /*disabled*/ ctx[17];
    			input.value = /*value*/ ctx[0];
    			add_location(input, file$1, 225, 1, 7167);
    			set_attributes(div2, div2_data);
    			toggle_class(div2, "disabled", /*disabled*/ ctx[17]);
    			toggle_class(div2, "reverse", /*directionAwareReverse*/ ctx[21]);
    			toggle_class(div2, "svelte-1ikqxku", true);
    			add_location(div2, file$1, 172, 0, 5857);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if (if_block0) if_block0.m(div0, null);
    			/*div0_binding*/ ctx[35](div0);
    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[36].bind(div0));
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			if (if_block1) if_block1.m(div1, null);
    			/*div1_binding*/ ctx[38](div1);
    			append_dev(div2, t1);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, input);
    			/*input_binding*/ ctx[40](input);
    			/*div2_binding*/ ctx[42](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "mousemove", /*handleMove*/ ctx[27], false, false, false),
    					listen_dev(window_1, "touchmove", /*handleMove*/ ctx[27], false, false, false),
    					listen_dev(window_1, "mouseup", /*cancelMove*/ ctx[26], false, false, false),
    					listen_dev(window_1, "touchend", /*cancelMove*/ ctx[26], false, false, false),
    					listen_dev(window_1, "touchcancel", /*cancelMove*/ ctx[26], false, false, false),
    					action_destroyer(/*forwardEvents*/ ctx[24].call(null, div2)),
    					listen_dev(div2, "mousedown", prevent_default(/*mousedown_handler*/ ctx[41]), false, true, false),
    					listen_dev(div2, "touchstart", /*handleTouchStart*/ ctx[29], false, false, false),
    					listen_dev(div2, "keydown", /*handleArrowKeys*/ ctx[28], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*tooltip*/ ctx[12] && !/*disabled*/ ctx[17]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*tooltip, disabled*/ 135168) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*min*/ 128) {
    				attr_dev(div0, "aria-valuemin", /*min*/ ctx[7]);
    			}

    			if (!current || dirty[0] & /*max*/ 256) {
    				attr_dev(div0, "aria-valuemax", /*max*/ ctx[8]);
    			}

    			if (!current || dirty[0] & /*value*/ 1) {
    				attr_dev(div0, "aria-valuenow", /*value*/ ctx[0]);
    			}

    			if (/*track*/ ctx[15]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*ticks*/ ctx[10]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					if_block2.m(div2, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!current || dirty[0] & /*min*/ 128) {
    				attr_dev(input, "min", /*min*/ ctx[7]);
    			}

    			if (!current || dirty[0] & /*max*/ 256) {
    				attr_dev(input, "max", /*max*/ ctx[8]);
    			}

    			if (!current || dirty[0] & /*step*/ 512) {
    				attr_dev(input, "step", /*step*/ ctx[9]);
    			}

    			if (!current || dirty[0] & /*disabled*/ 131072) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[17]);
    			}

    			if (!current || dirty[0] & /*value*/ 1) {
    				prop_dev(input, "value", /*value*/ ctx[0]);
    			}

    			set_attributes(div2, div2_data = get_spread_update(div2_levels, [
    				(!current || dirty[0] & /*disabled*/ 131072 && div2_tabindex_value !== (div2_tabindex_value = /*disabled*/ ctx[17] ? -1 : 0)) && { tabindex: div2_tabindex_value },
    				(!current || dirty[0] & /*percentage, thumbClientWidth*/ 12582912 && div2_style_value !== (div2_style_value = "--fds-slider-percentage: " + /*percentage*/ ctx[23] + "%; --fds-slider-thumb-offset: " + (/*thumbClientWidth*/ ctx[22] / 2 - linearScale([0, 50], [0, /*thumbClientWidth*/ ctx[22] / 2])(/*percentage*/ ctx[23])) + "px;")) && { style: div2_style_value },
    				(!current || dirty[0] & /*orientation, className*/ 327680 && div2_class_value !== (div2_class_value = "slider orientation-" + /*orientation*/ ctx[16] + " " + /*className*/ ctx[18])) && { class: div2_class_value },
    				dirty[0] & /*$$restProps*/ 1073741824 && /*$$restProps*/ ctx[30]
    			]));

    			toggle_class(div2, "disabled", /*disabled*/ ctx[17]);
    			toggle_class(div2, "reverse", /*directionAwareReverse*/ ctx[21]);
    			toggle_class(div2, "svelte-1ikqxku", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			/*div0_binding*/ ctx[35](null);
    			div0_resize_listener();
    			if (if_block1) if_block1.d();
    			/*div1_binding*/ ctx[38](null);
    			if (if_block2) if_block2.d();
    			/*input_binding*/ ctx[40](null);
    			/*div2_binding*/ ctx[42](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function linearScale(input, output) {
    	return value => {
    		if (input[0] === input[1] || output[0] === output[1]) return output[0];
    		const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    		return output[0] + ratio * (value - input[0]);
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let percentage;

    	const omit_props_names = [
    		"value","min","max","step","ticks","tickPlacement","tooltip","prefix","suffix","track","orientation","reverse","disabled","class","inputElement","containerElement","tickBarElement","thumbElement","railElement","trackElement","stepUp","stepDown"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Slider', slots, ['tooltip']);
    	let { value = 0 } = $$props;
    	let { min = 0 } = $$props;
    	let { max = 100 } = $$props;
    	let { step = 1 } = $$props;
    	let { ticks = [] } = $$props;
    	let { tickPlacement = "around" } = $$props;
    	let { tooltip = true } = $$props;
    	let { prefix = "" } = $$props;
    	let { suffix = "" } = $$props;
    	let { track = true } = $$props;
    	let { orientation = "horizontal" } = $$props;
    	let { reverse = false } = $$props;
    	let { disabled = false } = $$props;
    	let { class: className = "" } = $$props;
    	let { inputElement = null } = $$props;
    	let { containerElement = null } = $$props;
    	let { tickBarElement = null } = $$props;
    	let { thumbElement = null } = $$props;
    	let { railElement = null } = $$props;
    	let { trackElement = null } = $$props;
    	let dragging = false;
    	let holding = false;
    	let directionAwareReverse = false;
    	let thumbClientWidth = 20;
    	const dispatch = createEventDispatcher();
    	const forwardEvents = createEventForwarder(get_current_component(), ["input", "change", "beforeinput"]);

    	// Divides the current value minus the minimum value
    	// by the difference between the max and min values,
    	// and multiplies by 100 to get a percentage.
    	const valueToPercentage = v => (v - min) / (max - min) * 100;

    	function cancelMove() {
    		$$invalidate(20, holding = false);
    		$$invalidate(19, dragging = false);
    	}

    	function handleMove() {
    		if (holding) $$invalidate(19, dragging = true);
    	}

    	function calculateValue(event) {
    		if (disabled || !railElement) return;
    		const { top, bottom, left, right, width, height } = railElement.getBoundingClientRect();
    		const percentageX = event.touches ? event.touches[0].clientX : event.clientX;
    		const percentageY = event.touches ? event.touches[0].clientY : event.clientY;
    		const position = orientation === "horizontal" ? percentageX : percentageY;

    		const startingPos = orientation === "horizontal"
    		? directionAwareReverse ? right : left
    		: directionAwareReverse ? top : bottom;

    		const length = orientation === "horizontal" ? width : height;
    		let nextStep = min + Math.round((max - min) * ((position - startingPos) / length) * (directionAwareReverse ? -1 : 1) * (orientation === "vertical" ? -1 : 1) / step) * step;
    		if (nextStep <= min) nextStep = min; else if (nextStep >= max) nextStep = max;
    		$$invalidate(0, value = nextStep);
    	}

    	function handleArrowKeys(event) {
    		const { key } = event;
    		if (key === "ArrowDown" || key === "ArrowUp") event.preventDefault();

    		if (key === "ArrowLeft" || key === "ArrowDown" && !disabled) {
    			if (reverse) {
    				stepUp();
    			} else {
    				stepDown();
    			}
    		} else if (key === "ArrowRight" || key === "ArrowUp" && !disabled) {
    			if (reverse) {
    				stepDown();
    			} else {
    				stepUp();
    			}
    		}
    	}

    	function handleTouchStart(event) {
    		if (event.cancelable) event.preventDefault();
    		$$invalidate(20, holding = true);
    	}

    	function stepUp() {
    		$$invalidate(0, value += step);
    		if (value > max) $$invalidate(0, value = max);
    	}

    	function stepDown() {
    		$$invalidate(0, value -= step);
    		if (value < min) $$invalidate(0, value = min);
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			thumbElement = $$value;
    			$$invalidate(4, thumbElement);
    		});
    	}

    	function div0_elementresize_handler() {
    		thumbClientWidth = this.clientWidth;
    		$$invalidate(22, thumbClientWidth);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			trackElement = $$value;
    			$$invalidate(6, trackElement);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			railElement = $$value;
    			$$invalidate(5, railElement);
    		});
    	}

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			tickBarElement = $$value;
    			$$invalidate(3, tickBarElement);
    		});
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputElement = $$value;
    			$$invalidate(2, inputElement);
    		});
    	}

    	const mousedown_handler = () => {
    		$$invalidate(20, holding = true);
    		$$invalidate(19, dragging = true);
    	};

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			containerElement = $$value;
    			$$invalidate(1, containerElement);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(30, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('min' in $$new_props) $$invalidate(7, min = $$new_props.min);
    		if ('max' in $$new_props) $$invalidate(8, max = $$new_props.max);
    		if ('step' in $$new_props) $$invalidate(9, step = $$new_props.step);
    		if ('ticks' in $$new_props) $$invalidate(10, ticks = $$new_props.ticks);
    		if ('tickPlacement' in $$new_props) $$invalidate(11, tickPlacement = $$new_props.tickPlacement);
    		if ('tooltip' in $$new_props) $$invalidate(12, tooltip = $$new_props.tooltip);
    		if ('prefix' in $$new_props) $$invalidate(13, prefix = $$new_props.prefix);
    		if ('suffix' in $$new_props) $$invalidate(14, suffix = $$new_props.suffix);
    		if ('track' in $$new_props) $$invalidate(15, track = $$new_props.track);
    		if ('orientation' in $$new_props) $$invalidate(16, orientation = $$new_props.orientation);
    		if ('reverse' in $$new_props) $$invalidate(31, reverse = $$new_props.reverse);
    		if ('disabled' in $$new_props) $$invalidate(17, disabled = $$new_props.disabled);
    		if ('class' in $$new_props) $$invalidate(18, className = $$new_props.class);
    		if ('inputElement' in $$new_props) $$invalidate(2, inputElement = $$new_props.inputElement);
    		if ('containerElement' in $$new_props) $$invalidate(1, containerElement = $$new_props.containerElement);
    		if ('tickBarElement' in $$new_props) $$invalidate(3, tickBarElement = $$new_props.tickBarElement);
    		if ('thumbElement' in $$new_props) $$invalidate(4, thumbElement = $$new_props.thumbElement);
    		if ('railElement' in $$new_props) $$invalidate(5, railElement = $$new_props.railElement);
    		if ('trackElement' in $$new_props) $$invalidate(6, trackElement = $$new_props.trackElement);
    		if ('$$scope' in $$new_props) $$invalidate(43, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventForwarder,
    		TooltipSurface,
    		createEventDispatcher,
    		get_current_component,
    		value,
    		min,
    		max,
    		step,
    		ticks,
    		tickPlacement,
    		tooltip,
    		prefix,
    		suffix,
    		track,
    		orientation,
    		reverse,
    		disabled,
    		className,
    		inputElement,
    		containerElement,
    		tickBarElement,
    		thumbElement,
    		railElement,
    		trackElement,
    		dragging,
    		holding,
    		directionAwareReverse,
    		thumbClientWidth,
    		dispatch,
    		forwardEvents,
    		valueToPercentage,
    		cancelMove,
    		handleMove,
    		calculateValue,
    		handleArrowKeys,
    		handleTouchStart,
    		linearScale,
    		stepUp,
    		stepDown,
    		percentage
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('value' in $$props) $$invalidate(0, value = $$new_props.value);
    		if ('min' in $$props) $$invalidate(7, min = $$new_props.min);
    		if ('max' in $$props) $$invalidate(8, max = $$new_props.max);
    		if ('step' in $$props) $$invalidate(9, step = $$new_props.step);
    		if ('ticks' in $$props) $$invalidate(10, ticks = $$new_props.ticks);
    		if ('tickPlacement' in $$props) $$invalidate(11, tickPlacement = $$new_props.tickPlacement);
    		if ('tooltip' in $$props) $$invalidate(12, tooltip = $$new_props.tooltip);
    		if ('prefix' in $$props) $$invalidate(13, prefix = $$new_props.prefix);
    		if ('suffix' in $$props) $$invalidate(14, suffix = $$new_props.suffix);
    		if ('track' in $$props) $$invalidate(15, track = $$new_props.track);
    		if ('orientation' in $$props) $$invalidate(16, orientation = $$new_props.orientation);
    		if ('reverse' in $$props) $$invalidate(31, reverse = $$new_props.reverse);
    		if ('disabled' in $$props) $$invalidate(17, disabled = $$new_props.disabled);
    		if ('className' in $$props) $$invalidate(18, className = $$new_props.className);
    		if ('inputElement' in $$props) $$invalidate(2, inputElement = $$new_props.inputElement);
    		if ('containerElement' in $$props) $$invalidate(1, containerElement = $$new_props.containerElement);
    		if ('tickBarElement' in $$props) $$invalidate(3, tickBarElement = $$new_props.tickBarElement);
    		if ('thumbElement' in $$props) $$invalidate(4, thumbElement = $$new_props.thumbElement);
    		if ('railElement' in $$props) $$invalidate(5, railElement = $$new_props.railElement);
    		if ('trackElement' in $$props) $$invalidate(6, trackElement = $$new_props.trackElement);
    		if ('dragging' in $$props) $$invalidate(19, dragging = $$new_props.dragging);
    		if ('holding' in $$props) $$invalidate(20, holding = $$new_props.holding);
    		if ('directionAwareReverse' in $$props) $$invalidate(21, directionAwareReverse = $$new_props.directionAwareReverse);
    		if ('thumbClientWidth' in $$props) $$invalidate(22, thumbClientWidth = $$new_props.thumbClientWidth);
    		if ('percentage' in $$props) $$invalidate(23, percentage = $$new_props.percentage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*containerElement*/ 2 | $$self.$$.dirty[1] & /*reverse*/ 1) {
    			if (containerElement) {
    				$$invalidate(21, directionAwareReverse = (window === null || window === void 0
    				? void 0
    				: window.getComputedStyle(containerElement).direction) === "ltr"
    				? reverse
    				: !reverse);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*value, min, max, dragging*/ 524673) {
    			{
    				if (value <= min) $$invalidate(0, value = min); else if (value >= max) $$invalidate(0, value = max);

    				if (dragging) {
    					calculateValue(event);
    					$$invalidate(19, dragging = false);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*value*/ 1) {
    			dispatch("change", value);
    		}

    		if ($$self.$$.dirty[0] & /*value*/ 1) {
    			$$invalidate(23, percentage = valueToPercentage(value));
    		}
    	};

    	return [
    		value,
    		containerElement,
    		inputElement,
    		tickBarElement,
    		thumbElement,
    		railElement,
    		trackElement,
    		min,
    		max,
    		step,
    		ticks,
    		tickPlacement,
    		tooltip,
    		prefix,
    		suffix,
    		track,
    		orientation,
    		disabled,
    		className,
    		dragging,
    		holding,
    		directionAwareReverse,
    		thumbClientWidth,
    		percentage,
    		forwardEvents,
    		valueToPercentage,
    		cancelMove,
    		handleMove,
    		handleArrowKeys,
    		handleTouchStart,
    		$$restProps,
    		reverse,
    		stepUp,
    		stepDown,
    		slots,
    		div0_binding,
    		div0_elementresize_handler,
    		div_binding,
    		div1_binding,
    		div_binding_1,
    		input_binding,
    		mousedown_handler,
    		div2_binding,
    		$$scope
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{
    				value: 0,
    				min: 7,
    				max: 8,
    				step: 9,
    				ticks: 10,
    				tickPlacement: 11,
    				tooltip: 12,
    				prefix: 13,
    				suffix: 14,
    				track: 15,
    				orientation: 16,
    				reverse: 31,
    				disabled: 17,
    				class: 18,
    				inputElement: 2,
    				containerElement: 1,
    				tickBarElement: 3,
    				thumbElement: 4,
    				railElement: 5,
    				trackElement: 6,
    				stepUp: 32,
    				stepDown: 33
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get value() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ticks() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ticks(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickPlacement() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickPlacement(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltip() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltip(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get suffix() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set suffix(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get track() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set track(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get orientation() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set orientation(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputElement() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputElement(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerElement() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerElement(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickBarElement() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickBarElement(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbElement() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbElement(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get railElement() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set railElement(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get trackElement() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trackElement(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stepUp() {
    		return this.$$.ctx[32];
    	}

    	set stepUp(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stepDown() {
    		return this.$$.ctx[33];
    	}

    	set stepDown(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	child_ctx[38] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[39] = list;
    	child_ctx[40] = i;
    	return child_ctx;
    }

    // (154:4) <Button variant="accent" on:click={synthesis}>
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Play");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(154:4) <Button variant=\\\"accent\\\" on:click={synthesis}>",
    		ctx
    	});

    	return block;
    }

    // (155:4) <Button on:click={fetchAccentPhrase}>
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Flush");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(155:4) <Button on:click={fetchAccentPhrase}>",
    		ctx
    	});

    	return block;
    }

    // (157:4) <Button on:click={downloadSound}>
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Export");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(157:4) <Button on:click={downloadSound}>",
    		ctx
    	});

    	return block;
    }

    // (162:6) <RadioButton bind:group={curPanel} value="pit" style="margin: 0 0 0 30px">
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Pitch");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(162:6) <RadioButton bind:group={curPanel} value=\\\"pit\\\" style=\\\"margin: 0 0 0 30px\\\">",
    		ctx
    	});

    	return block;
    }

    // (163:6) <RadioButton bind:group={curPanel} value="dur" style="margin: 0 0 0 15px">
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Duration");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(163:6) <RadioButton bind:group={curPanel} value=\\\"dur\\\" style=\\\"margin: 0 0 0 15px\\\">",
    		ctx
    	});

    	return block;
    }

    // (164:6) <RadioButton bind:group={curPanel} value="eng" style="margin: 0 0 0 15px">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Energy");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(164:6) <RadioButton bind:group={curPanel} value=\\\"eng\\\" style=\\\"margin: 0 0 0 15px\\\">",
    		ctx
    	});

    	return block;
    }

    // (192:14) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let t0_value = /*marks*/ ctx[11].eng.toFixed(2) + "";
    	let t0;
    	let t1;
    	let slider;
    	let updating_value;
    	let current;

    	function slider_value_binding_2(value) {
    		/*slider_value_binding_2*/ ctx[26](value, /*marks*/ ctx[11]);
    	}

    	function wheel_handler_5(...args) {
    		return /*wheel_handler_5*/ ctx[27](/*marks*/ ctx[11], /*each_value_1*/ ctx[39], /*j*/ ctx[40], ...args);
    	}

    	let slider_props = {
    		orientation: "vertical",
    		min: 0,
    		max: 4,
    		step: 0.01,
    		tooltip: false
    	};

    	if (/*marks*/ ctx[11].eng !== void 0) {
    		slider_props.value = /*marks*/ ctx[11].eng;
    	}

    	slider = new Slider({ props: slider_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider, 'value', slider_value_binding_2));
    	slider.$on("wheel", wheel_handler_5);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(slider.$$.fragment);
    			set_style(div, "margin-bottom", "5px");
    			attr_dev(div, "class", "svelte-1gsx3hw");
    			add_location(div, file, 192, 16, 7300);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			mount_component(slider, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*audioStore*/ 2) && t0_value !== (t0_value = /*marks*/ ctx[11].eng.toFixed(2) + "")) set_data_dev(t0, t0_value);
    			const slider_changes = {};

    			if (!updating_value && dirty[0] & /*audioStore*/ 2) {
    				updating_value = true;
    				slider_changes.value = /*marks*/ ctx[11].eng;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider.$set(slider_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			destroy_component(slider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(192:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (187:43) 
    function create_if_block_2(ctx) {
    	let div;
    	let t0_value = /*marks*/ ctx[11].dur.toFixed(2) + "";
    	let t0;
    	let t1;
    	let slider;
    	let updating_value;
    	let current;

    	function slider_value_binding_1(value) {
    		/*slider_value_binding_1*/ ctx[24](value, /*marks*/ ctx[11]);
    	}

    	function wheel_handler_4(...args) {
    		return /*wheel_handler_4*/ ctx[25](/*marks*/ ctx[11], /*each_value_1*/ ctx[39], /*j*/ ctx[40], ...args);
    	}

    	let slider_props = {
    		orientation: "vertical",
    		min: 0,
    		max: 0.3,
    		step: 0.01,
    		tooltip: false
    	};

    	if (/*marks*/ ctx[11].dur !== void 0) {
    		slider_props.value = /*marks*/ ctx[11].dur;
    	}

    	slider = new Slider({ props: slider_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider, 'value', slider_value_binding_1));
    	slider.$on("wheel", wheel_handler_4);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(slider.$$.fragment);
    			set_style(div, "margin-bottom", "5px");
    			attr_dev(div, "class", "svelte-1gsx3hw");
    			add_location(div, file, 187, 16, 6948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			mount_component(slider, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*audioStore*/ 2) && t0_value !== (t0_value = /*marks*/ ctx[11].dur.toFixed(2) + "")) set_data_dev(t0, t0_value);
    			const slider_changes = {};

    			if (!updating_value && dirty[0] & /*audioStore*/ 2) {
    				updating_value = true;
    				slider_changes.value = /*marks*/ ctx[11].dur;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider.$set(slider_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			destroy_component(slider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(187:43) ",
    		ctx
    	});

    	return block;
    }

    // (182:14) {#if curPanel === "pit"}
    function create_if_block_1(ctx) {
    	let div;
    	let t0_value = /*marks*/ ctx[11].pit.toFixed(2) + "";
    	let t0;
    	let t1;
    	let slider;
    	let updating_value;
    	let current;

    	function slider_value_binding(value) {
    		/*slider_value_binding*/ ctx[22](value, /*marks*/ ctx[11]);
    	}

    	function wheel_handler_3(...args) {
    		return /*wheel_handler_3*/ ctx[23](/*marks*/ ctx[11], /*each_value_1*/ ctx[39], /*j*/ ctx[40], ...args);
    	}

    	let slider_props = {
    		orientation: "vertical",
    		min: 3.0,
    		max: 6.5,
    		step: 0.01,
    		tooltip: false
    	};

    	if (/*marks*/ ctx[11].pit !== void 0) {
    		slider_props.value = /*marks*/ ctx[11].pit;
    	}

    	slider = new Slider({ props: slider_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider, 'value', slider_value_binding));
    	slider.$on("wheel", wheel_handler_3);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(slider.$$.fragment);
    			set_style(div, "margin-bottom", "5px");
    			attr_dev(div, "class", "svelte-1gsx3hw");
    			add_location(div, file, 182, 16, 6572);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			mount_component(slider, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*audioStore*/ 2) && t0_value !== (t0_value = /*marks*/ ctx[11].pit.toFixed(2) + "")) set_data_dev(t0, t0_value);
    			const slider_changes = {};

    			if (!updating_value && dirty[0] & /*audioStore*/ 2) {
    				updating_value = true;
    				slider_changes.value = /*marks*/ ctx[11].pit;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider.$set(slider_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			destroy_component(slider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(182:14) {#if curPanel === \\\"pit\\\"}",
    		ctx
    	});

    	return block;
    }

    // (203:20) {:else}
    function create_else_block(ctx) {
    	let t_value = /*marks*/ ctx[11].mark + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*audioStore*/ 2 && t_value !== (t_value = /*marks*/ ctx[11].mark + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(203:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (201:20) {#if marks.stress !== null}
    function create_if_block(ctx) {
    	let t_value = /*marks*/ ctx[11].mark + /*marks*/ ctx[11].stress + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*audioStore*/ 2 && t_value !== (t_value = /*marks*/ ctx[11].mark + /*marks*/ ctx[11].stress + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(201:20) {#if marks.stress !== null}",
    		ctx
    	});

    	return block;
    }

    // (199:16) <Flyout placement="right">
    function create_default_slot(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*marks*/ ctx[11].stress !== null) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			set_style(div, "cursor", "pointer");
    			attr_dev(div, "class", "svelte-1gsx3hw");
    			add_location(div, file, 199, 18, 7715);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[29], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(199:16) <Flyout placement=\\\"right\\\">",
    		ctx
    	});

    	return block;
    }

    // (207:18) <svelte:fragment slot="flyout">
    function create_flyout_slot(ctx) {
    	let input;
    	let input_value_value;
    	let mounted;
    	let dispose;

    	function change_handler(...args) {
    		return /*change_handler*/ ctx[28](/*i*/ ctx[38], /*j*/ ctx[40], ...args);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");

    			input.value = input_value_value = /*marks*/ ctx[11].mark + (/*marks*/ ctx[11].stress == null
    			? ""
    			: /*marks*/ ctx[11].stress);

    			attr_dev(input, "class", "svelte-1gsx3hw");
    			add_location(input, file, 207, 20, 8074);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", change_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*audioStore*/ 2 && input_value_value !== (input_value_value = /*marks*/ ctx[11].mark + (/*marks*/ ctx[11].stress == null
    			? ""
    			: /*marks*/ ctx[11].stress)) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_flyout_slot.name,
    		type: "slot",
    		source: "(207:18) <svelte:fragment slot=\\\"flyout\\\">",
    		ctx
    	});

    	return block;
    }

    // (179:8) {#each audioItem.marks as marks, j}
    function create_each_block_1(ctx) {
    	let div2;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let div0;
    	let flyout;
    	let current;
    	const if_block_creators = [create_if_block_1, create_if_block_2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*curPanel*/ ctx[2] === "pit") return 0;
    		if (/*curPanel*/ ctx[2] === "dur") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	flyout = new FlyoutWrapper({
    			props: {
    				placement: "right",
    				$$slots: {
    					flyout: [create_flyout_slot],
    					default: [create_default_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			if_block.c();
    			t = space();
    			div0 = element("div");
    			create_component(flyout.$$.fragment);
    			attr_dev(div0, "class", "svelte-1gsx3hw");
    			add_location(div0, file, 197, 14, 7646);
    			set_style(div1, "block-size", "120px");
    			set_style(div1, "margin-left", "12px");
    			set_style(div1, "margin-right", "12px");
    			attr_dev(div1, "class", "svelte-1gsx3hw");
    			add_location(div1, file, 180, 12, 6445);
    			set_style(div2, "display", "grid");
    			attr_dev(div2, "class", "svelte-1gsx3hw");
    			add_location(div2, file, 179, 10, 6404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			if_blocks[current_block_type_index].m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);
    			mount_component(flyout, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, t);
    			}

    			const flyout_changes = {};

    			if (dirty[0] & /*audioStore*/ 2 | dirty[1] & /*$$scope*/ 1024) {
    				flyout_changes.$$scope = { dirty, ctx };
    			}

    			flyout.$set(flyout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(flyout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(flyout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    			destroy_component(flyout);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(179:8) {#each audioItem.marks as marks, j}",
    		ctx
    	});

    	return block;
    }

    // (178:6) {#each audioStore as audioItem, i}
    function create_each_block(ctx) {
    	let t;
    	let div;
    	let current;
    	let each_value_1 = /*audioItem*/ ctx[36].marks;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div = element("div");
    			attr_dev(div, "class", "space svelte-1gsx3hw");
    			add_location(div, file, 214, 8, 8336);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*audioStore, handlePhonemeInput, shiftKeyFlag, curPanel*/ 1038) {
    				each_value_1 = /*audioItem*/ ctx[36].marks;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(178:6) {#each audioStore as audioItem, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let input;
    	let t2;
    	let button2;
    	let t3;
    	let div10;
    	let div1;
    	let radiobutton0;
    	let updating_group;
    	let t4;
    	let radiobutton1;
    	let updating_group_1;
    	let t5;
    	let radiobutton2;
    	let updating_group_2;
    	let t6;
    	let div8;
    	let slider0;
    	let updating_value;
    	let t7;
    	let div2;
    	let t8_value = /*pit_shift*/ ctx[5].toFixed(2) + "";
    	let t8;
    	let t9;
    	let div3;
    	let t11;
    	let slider1;
    	let updating_value_1;
    	let t12;
    	let div4;
    	let t13_value = /*dur_scale*/ ctx[4].toFixed(2) + "";
    	let t13;
    	let t14;
    	let div5;
    	let t16;
    	let slider2;
    	let updating_value_2;
    	let t17;
    	let div6;
    	let t18_value = /*eng_shift*/ ctx[6].toFixed(2) + "";
    	let t18;
    	let t19;
    	let div7;
    	let t21;
    	let div9;
    	let current;
    	let mounted;
    	let dispose;

    	button0 = new Button({
    			props: {
    				variant: "accent",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*synthesis*/ ctx[8]);

    	button1 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*fetchAccentPhrase*/ ctx[7]);

    	button2 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*downloadSound*/ ctx[9]);

    	function radiobutton0_group_binding(value) {
    		/*radiobutton0_group_binding*/ ctx[13](value);
    	}

    	let radiobutton0_props = {
    		value: "pit",
    		style: "margin: 0 0 0 30px",
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	};

    	if (/*curPanel*/ ctx[2] !== void 0) {
    		radiobutton0_props.group = /*curPanel*/ ctx[2];
    	}

    	radiobutton0 = new RadioButton({
    			props: radiobutton0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiobutton0, 'group', radiobutton0_group_binding));

    	function radiobutton1_group_binding(value) {
    		/*radiobutton1_group_binding*/ ctx[14](value);
    	}

    	let radiobutton1_props = {
    		value: "dur",
    		style: "margin: 0 0 0 15px",
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};

    	if (/*curPanel*/ ctx[2] !== void 0) {
    		radiobutton1_props.group = /*curPanel*/ ctx[2];
    	}

    	radiobutton1 = new RadioButton({
    			props: radiobutton1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiobutton1, 'group', radiobutton1_group_binding));

    	function radiobutton2_group_binding(value) {
    		/*radiobutton2_group_binding*/ ctx[15](value);
    	}

    	let radiobutton2_props = {
    		value: "eng",
    		style: "margin: 0 0 0 15px",
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*curPanel*/ ctx[2] !== void 0) {
    		radiobutton2_props.group = /*curPanel*/ ctx[2];
    	}

    	radiobutton2 = new RadioButton({
    			props: radiobutton2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiobutton2, 'group', radiobutton2_group_binding));

    	function slider0_value_binding(value) {
    		/*slider0_value_binding*/ ctx[16](value);
    	}

    	let slider0_props = {
    		min: -0.5,
    		max: 0.5,
    		step: 0.01,
    		tooltip: false
    	};

    	if (/*pit_shift*/ ctx[5] !== void 0) {
    		slider0_props.value = /*pit_shift*/ ctx[5];
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, 'value', slider0_value_binding));
    	slider0.$on("wheel", /*wheel_handler*/ ctx[17]);

    	function slider1_value_binding(value) {
    		/*slider1_value_binding*/ ctx[18](value);
    	}

    	let slider1_props = {
    		min: 0,
    		max: 2,
    		step: 0.01,
    		tooltip: false
    	};

    	if (/*dur_scale*/ ctx[4] !== void 0) {
    		slider1_props.value = /*dur_scale*/ ctx[4];
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, 'value', slider1_value_binding));
    	slider1.$on("wheel", /*wheel_handler_1*/ ctx[19]);

    	function slider2_value_binding(value) {
    		/*slider2_value_binding*/ ctx[20](value);
    	}

    	let slider2_props = {
    		min: -0.5,
    		max: 0.5,
    		step: 0.01,
    		tooltip: false
    	};

    	if (/*eng_shift*/ ctx[6] !== void 0) {
    		slider2_props.value = /*eng_shift*/ ctx[6];
    	}

    	slider2 = new Slider({ props: slider2_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider2, 'value', slider2_value_binding));
    	slider2.$on("wheel", /*wheel_handler_2*/ ctx[21]);
    	let each_value = /*audioStore*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(button1.$$.fragment);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			create_component(button2.$$.fragment);
    			t3 = space();
    			div10 = element("div");
    			div1 = element("div");
    			create_component(radiobutton0.$$.fragment);
    			t4 = space();
    			create_component(radiobutton1.$$.fragment);
    			t5 = space();
    			create_component(radiobutton2.$$.fragment);
    			t6 = space();
    			div8 = element("div");
    			create_component(slider0.$$.fragment);
    			t7 = space();
    			div2 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			div3 = element("div");
    			div3.textContent = "Pitch Scale";
    			t11 = space();
    			create_component(slider1.$$.fragment);
    			t12 = space();
    			div4 = element("div");
    			t13 = text(t13_value);
    			t14 = space();
    			div5 = element("div");
    			div5.textContent = "Duration Scale";
    			t16 = space();
    			create_component(slider2.$$.fragment);
    			t17 = space();
    			div6 = element("div");
    			t18 = text(t18_value);
    			t19 = space();
    			div7 = element("div");
    			div7.textContent = "Energy Scale";
    			t21 = space();
    			div9 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(input, "min-width", "50%");
    			attr_dev(input, "id", "input");
    			attr_dev(input, "class", "svelte-1gsx3hw");
    			add_location(input, file, 155, 4, 4902);
    			attr_dev(div0, "class", "svelte-1gsx3hw");
    			add_location(div0, file, 152, 2, 4769);
    			attr_dev(div1, "class", "div1 svelte-1gsx3hw");
    			add_location(div1, file, 160, 4, 5058);
    			set_style(div2, "margin", "5px");
    			attr_dev(div2, "class", "svelte-1gsx3hw");
    			add_location(div2, file, 167, 6, 5602);
    			set_style(div3, "margin", "5px");
    			attr_dev(div3, "class", "svelte-1gsx3hw");
    			add_location(div3, file, 168, 6, 5663);
    			set_style(div4, "margin", "5px");
    			attr_dev(div4, "class", "svelte-1gsx3hw");
    			add_location(div4, file, 170, 6, 5879);
    			set_style(div5, "margin", "5px");
    			attr_dev(div5, "class", "svelte-1gsx3hw");
    			add_location(div5, file, 171, 6, 5940);
    			set_style(div6, "margin", "5px");
    			attr_dev(div6, "class", "svelte-1gsx3hw");
    			add_location(div6, file, 173, 6, 6165);
    			set_style(div7, "margin", "5px");
    			attr_dev(div7, "class", "svelte-1gsx3hw");
    			add_location(div7, file, 174, 6, 6226);
    			attr_dev(div8, "class", "sliders svelte-1gsx3hw");
    			add_location(div8, file, 165, 4, 5401);
    			attr_dev(div9, "class", "div2 svelte-1gsx3hw");
    			add_location(div9, file, 176, 4, 6287);
    			attr_dev(div10, "class", "parent svelte-1gsx3hw");
    			add_location(div10, file, 159, 2, 5032);
    			attr_dev(main, "class", "svelte-1gsx3hw");
    			add_location(main, file, 151, 0, 4759);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(button0, div0, null);
    			append_dev(div0, t0);
    			mount_component(button1, div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, input);
    			set_input_value(input, /*text*/ ctx[0]);
    			append_dev(div0, t2);
    			mount_component(button2, div0, null);
    			append_dev(main, t3);
    			append_dev(main, div10);
    			append_dev(div10, div1);
    			mount_component(radiobutton0, div1, null);
    			append_dev(div1, t4);
    			mount_component(radiobutton1, div1, null);
    			append_dev(div1, t5);
    			mount_component(radiobutton2, div1, null);
    			append_dev(div10, t6);
    			append_dev(div10, div8);
    			mount_component(slider0, div8, null);
    			append_dev(div8, t7);
    			append_dev(div8, div2);
    			append_dev(div2, t8);
    			append_dev(div8, t9);
    			append_dev(div8, div3);
    			append_dev(div8, t11);
    			mount_component(slider1, div8, null);
    			append_dev(div8, t12);
    			append_dev(div8, div4);
    			append_dev(div4, t13);
    			append_dev(div8, t14);
    			append_dev(div8, div5);
    			append_dev(div8, t16);
    			mount_component(slider2, div8, null);
    			append_dev(div8, t17);
    			append_dev(div8, div6);
    			append_dev(div6, t18);
    			append_dev(div8, t19);
    			append_dev(div8, div7);
    			append_dev(div10, t21);
    			append_dev(div10, div9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div9, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);

    			if (dirty[0] & /*text*/ 1 && input.value !== /*text*/ ctx[0]) {
    				set_input_value(input, /*text*/ ctx[0]);
    			}

    			const button2_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    			const radiobutton0_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
    				radiobutton0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_group && dirty[0] & /*curPanel*/ 4) {
    				updating_group = true;
    				radiobutton0_changes.group = /*curPanel*/ ctx[2];
    				add_flush_callback(() => updating_group = false);
    			}

    			radiobutton0.$set(radiobutton0_changes);
    			const radiobutton1_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
    				radiobutton1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_group_1 && dirty[0] & /*curPanel*/ 4) {
    				updating_group_1 = true;
    				radiobutton1_changes.group = /*curPanel*/ ctx[2];
    				add_flush_callback(() => updating_group_1 = false);
    			}

    			radiobutton1.$set(radiobutton1_changes);
    			const radiobutton2_changes = {};

    			if (dirty[1] & /*$$scope*/ 1024) {
    				radiobutton2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_group_2 && dirty[0] & /*curPanel*/ 4) {
    				updating_group_2 = true;
    				radiobutton2_changes.group = /*curPanel*/ ctx[2];
    				add_flush_callback(() => updating_group_2 = false);
    			}

    			radiobutton2.$set(radiobutton2_changes);
    			const slider0_changes = {};

    			if (!updating_value && dirty[0] & /*pit_shift*/ 32) {
    				updating_value = true;
    				slider0_changes.value = /*pit_shift*/ ctx[5];
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			if ((!current || dirty[0] & /*pit_shift*/ 32) && t8_value !== (t8_value = /*pit_shift*/ ctx[5].toFixed(2) + "")) set_data_dev(t8, t8_value);
    			const slider1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*dur_scale*/ 16) {
    				updating_value_1 = true;
    				slider1_changes.value = /*dur_scale*/ ctx[4];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			if ((!current || dirty[0] & /*dur_scale*/ 16) && t13_value !== (t13_value = /*dur_scale*/ ctx[4].toFixed(2) + "")) set_data_dev(t13, t13_value);
    			const slider2_changes = {};

    			if (!updating_value_2 && dirty[0] & /*eng_shift*/ 64) {
    				updating_value_2 = true;
    				slider2_changes.value = /*eng_shift*/ ctx[6];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slider2.$set(slider2_changes);
    			if ((!current || dirty[0] & /*eng_shift*/ 64) && t18_value !== (t18_value = /*eng_shift*/ ctx[6].toFixed(2) + "")) set_data_dev(t18, t18_value);

    			if (dirty[0] & /*audioStore, handlePhonemeInput, shiftKeyFlag, curPanel*/ 1038) {
    				each_value = /*audioStore*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div9, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(radiobutton0.$$.fragment, local);
    			transition_in(radiobutton1.$$.fragment, local);
    			transition_in(radiobutton2.$$.fragment, local);
    			transition_in(slider0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(slider2.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(radiobutton0.$$.fragment, local);
    			transition_out(radiobutton1.$$.fragment, local);
    			transition_out(radiobutton2.$$.fragment, local);
    			transition_out(slider0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(slider2.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    			destroy_component(radiobutton0);
    			destroy_component(radiobutton1);
    			destroy_component(radiobutton2);
    			destroy_component(slider0);
    			destroy_component(slider1);
    			destroy_component(slider2);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function saveFile(blob, filename) {
    	const a = document.createElement('a');
    	document.body.appendChild(a);
    	const url = URL.createObjectURL(blob);
    	a.href = url;
    	a.download = filename;
    	a.click();

    	setTimeout(
    		() => {
    			URL.revokeObjectURL(url);
    			document.body.removeChild(a);
    		},
    		0
    	);
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const ctx = new AudioContext();

    	const marks = [
    		'',
    		'AA',
    		'AE',
    		'AH',
    		'AO',
    		'AW',
    		'AY',
    		'B',
    		'CH',
    		'D',
    		'DH',
    		'EH',
    		'ER',
    		'EY',
    		'F',
    		'G',
    		'HH',
    		'IH',
    		'IY',
    		'JH',
    		'K',
    		'L',
    		'M',
    		'N',
    		'NG',
    		'OW',
    		'OY',
    		'P',
    		'R',
    		'S',
    		'SH',
    		'T',
    		'TH',
    		'UH',
    		'UW',
    		'V',
    		'W',
    		'Y',
    		'Z',
    		'ZH',
    		'sil',
    		'sp',
    		'spn'
    	];

    	let text = "";
    	let audioStore = [];
    	let audio;
    	let audioBuffer;
    	let curPanel = "pit";

    	const fetchAccentPhrase = async () => {
    		let requestOptions = { method: 'GET', redirect: "follow" };
    		let url = "/accent_phrases?" + "text=" + text;
    		fetch(url, requestOptions).then(response => response.text()).then(result => $$invalidate(1, audioStore = JSON.parse(result))).catch(error => console.log('error', error));
    	};

    	const changePhoneme = async (accent_phrases, idx) => {
    		let data = JSON.stringify(accent_phrases);
    		let myHeaders = new Headers();
    		myHeaders.append("Content-Type", "application/json");

    		let requestOptions = {
    			method: 'POST',
    			headers: myHeaders,
    			body: data,
    			redirect: 'follow'
    		};

    		const url = "/change_phoneme";

    		fetch(url, requestOptions).then(response => response.text()).then(result => {
    			let newAudioStore = JSON.parse(result);
    			$$invalidate(1, audioStore[idx] = newAudioStore[idx], audioStore);
    			$$invalidate(1, audioStore);
    			console.log("Hello!");
    		}).catch(error => console.log('error', error));
    	};

    	const synthesis = async () => {
    		let data = JSON.stringify(audioStore);
    		let myHeaders = new Headers();
    		myHeaders.append("Content-Type", "application/json");

    		let requestOptions = {
    			method: 'POST',
    			headers: myHeaders,
    			body: data,
    			redirect: 'follow'
    		};

    		const URL = "/synthesis?" + "pit_shift=" + pit_shift.toFixed(2) + "&" + "dur_scale=" + dur_scale.toFixed(2) + "&" + "eng_shift=" + eng_shift.toFixed(2);

    		fetch(URL, requestOptions).then(response => response.arrayBuffer()).then(arrayBuffer => {
    			audioBuffer = copy(arrayBuffer);
    			return ctx.decodeAudioData(arrayBuffer);
    		}).then(data => audio = data).catch(error => console.log('error', error)).then(() => playSound());
    	};

    	const playSound = () => {
    		const sound = ctx.createBufferSource();
    		sound.buffer = audio;
    		sound.connect(ctx.destination);
    		sound.start(ctx.currentTime);
    	};

    	const downloadSound = () => {
    		const blob = new Blob([audioBuffer]);
    		saveFile(blob, text + ".wav");
    	};

    	const copy = src => {
    		let dst = new ArrayBuffer(src.byteLength);
    		new Uint8Array(dst).set(new Uint8Array(src));
    		return dst;
    	};

    	document.addEventListener("keypress", event => {
    		const input = document.activeElement;

    		if (event.key == " " && !(input.id == "input") && input instanceof HTMLElement) {
    			input.blur();
    			synthesis();
    		}
    	});

    	let shiftKeyFlag = 1;

    	document.addEventListener("keydown", event => {
    		if (event.key == "Shift") {
    			$$invalidate(3, shiftKeyFlag = 0);
    		}
    	});

    	document.addEventListener("keyup", event => {
    		if (event.key == "Shift") {
    			$$invalidate(3, shiftKeyFlag = 1);
    		}
    	});

    	function handlePhonemeInput(e, i, j) {
    		const newPhoneme = e.target.value;

    		if (newPhoneme.length == 0) {
    			audioStore[i].marks.splice(j, 1);
    			return;
    		}

    		const phonemes = newPhoneme.split(",");
    		const newAccentItems = [];
    		let stress = null;

    		for (let p = 0; p < phonemes.length; p++) {
    			let phoneme = phonemes[p];
    			let mark = "";

    			if (phoneme.length >= 3 && phoneme != "spn") {
    				mark = phoneme.slice(0, -1);
    				stress = Number(phoneme.slice(-1));
    			} else {
    				mark = phoneme;
    			}

    			if (mark == "") {
    				continue;
    			}

    			const accentItem = { mark, stress, pit: 0, dur: 0, eng: 0 };
    			newAccentItems.push(accentItem);
    		}

    		audioStore[i].marks.splice(j, 1, ...newAccentItems);
    		changePhoneme(audioStore, i);
    	}

    	let dur_scale = 1.0;
    	let pit_shift = 0;
    	let eng_shift = 0;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		text = this.value;
    		$$invalidate(0, text);
    	}

    	function radiobutton0_group_binding(value) {
    		curPanel = value;
    		$$invalidate(2, curPanel);
    	}

    	function radiobutton1_group_binding(value) {
    		curPanel = value;
    		$$invalidate(2, curPanel);
    	}

    	function radiobutton2_group_binding(value) {
    		curPanel = value;
    		$$invalidate(2, curPanel);
    	}

    	function slider0_value_binding(value) {
    		pit_shift = value;
    		$$invalidate(5, pit_shift);
    	}

    	const wheel_handler = event => $$invalidate(5, pit_shift += 0.01 * -Math.sign(event.deltaY) * shiftKeyFlag);

    	function slider1_value_binding(value) {
    		dur_scale = value;
    		$$invalidate(4, dur_scale);
    	}

    	const wheel_handler_1 = event => $$invalidate(4, dur_scale += 0.01 * -Math.sign(event.deltaY) * shiftKeyFlag);

    	function slider2_value_binding(value) {
    		eng_shift = value;
    		$$invalidate(6, eng_shift);
    	}

    	const wheel_handler_2 = event => $$invalidate(6, eng_shift += 0.01 * -Math.sign(event.deltaY) * shiftKeyFlag);

    	function slider_value_binding(value, marks) {
    		if ($$self.$$.not_equal(marks.pit, value)) {
    			marks.pit = value;
    			$$invalidate(1, audioStore);
    		}
    	}

    	const wheel_handler_3 = (marks, each_value_1, j, event) => $$invalidate(1, each_value_1[j].pit += 0.01 * -Math.sign(event.deltaY) * shiftKeyFlag, audioStore);

    	function slider_value_binding_1(value, marks) {
    		if ($$self.$$.not_equal(marks.dur, value)) {
    			marks.dur = value;
    			$$invalidate(1, audioStore);
    		}
    	}

    	const wheel_handler_4 = (marks, each_value_1, j, event) => $$invalidate(1, each_value_1[j].dur += 0.01 * -Math.sign(event.deltaY) * shiftKeyFlag, audioStore);

    	function slider_value_binding_2(value, marks) {
    		if ($$self.$$.not_equal(marks.eng, value)) {
    			marks.eng = value;
    			$$invalidate(1, audioStore);
    		}
    	}

    	const wheel_handler_5 = (marks, each_value_1, j, event) => $$invalidate(1, each_value_1[j].eng += 0.01 * -Math.sign(event.deltaY) * shiftKeyFlag, audioStore);
    	const change_handler = (i, j, e) => handlePhonemeInput(e, i, j);

    	const click_handler = () => {
    		console.log("hello?");
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		Flyout: FlyoutWrapper,
    		RadioButton,
    		Slider,
    		ctx,
    		marks,
    		text,
    		audioStore,
    		audio,
    		audioBuffer,
    		curPanel,
    		fetchAccentPhrase,
    		changePhoneme,
    		synthesis,
    		playSound,
    		downloadSound,
    		copy,
    		saveFile,
    		shiftKeyFlag,
    		handlePhonemeInput,
    		dur_scale,
    		pit_shift,
    		eng_shift
    	});

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('audioStore' in $$props) $$invalidate(1, audioStore = $$props.audioStore);
    		if ('audio' in $$props) audio = $$props.audio;
    		if ('audioBuffer' in $$props) audioBuffer = $$props.audioBuffer;
    		if ('curPanel' in $$props) $$invalidate(2, curPanel = $$props.curPanel);
    		if ('shiftKeyFlag' in $$props) $$invalidate(3, shiftKeyFlag = $$props.shiftKeyFlag);
    		if ('dur_scale' in $$props) $$invalidate(4, dur_scale = $$props.dur_scale);
    		if ('pit_shift' in $$props) $$invalidate(5, pit_shift = $$props.pit_shift);
    		if ('eng_shift' in $$props) $$invalidate(6, eng_shift = $$props.eng_shift);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		text,
    		audioStore,
    		curPanel,
    		shiftKeyFlag,
    		dur_scale,
    		pit_shift,
    		eng_shift,
    		fetchAccentPhrase,
    		synthesis,
    		downloadSound,
    		handlePhonemeInput,
    		marks,
    		input_input_handler,
    		radiobutton0_group_binding,
    		radiobutton1_group_binding,
    		radiobutton2_group_binding,
    		slider0_value_binding,
    		wheel_handler,
    		slider1_value_binding,
    		wheel_handler_1,
    		slider2_value_binding,
    		wheel_handler_2,
    		slider_value_binding,
    		wheel_handler_3,
    		slider_value_binding_1,
    		wheel_handler_4,
    		slider_value_binding_2,
    		wheel_handler_5,
    		change_handler,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
