
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
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
        return style_element;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
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
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
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
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.2' }, detail), true));
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

    /* src\components\SectionHeading.svelte generated by Svelte v3.43.2 */

    const file$h = "src\\components\\SectionHeading.svelte";
    const get_subtitle_slot_changes = dirty => ({});
    const get_subtitle_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});

    // (8:23) {sectionTitle}
    function fallback_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*sectionTitle*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sectionTitle*/ 1) set_data_dev(t, /*sectionTitle*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(8:23) {sectionTitle}",
    		ctx
    	});

    	return block;
    }

    // (11:26) {sectionSubtitle}
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*sectionSubtitle*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sectionSubtitle*/ 2) set_data_dev(t, /*sectionSubtitle*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(11:26) {sectionSubtitle}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div;
    	let h3;
    	let t;
    	let p;
    	let current;
    	const title_slot_template = /*#slots*/ ctx[3].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[2], get_title_slot_context);
    	const title_slot_or_fallback = title_slot || fallback_block_1(ctx);
    	const subtitle_slot_template = /*#slots*/ ctx[3].subtitle;
    	const subtitle_slot = create_slot(subtitle_slot_template, ctx, /*$$scope*/ ctx[2], get_subtitle_slot_context);
    	const subtitle_slot_or_fallback = subtitle_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			if (title_slot_or_fallback) title_slot_or_fallback.c();
    			t = space();
    			p = element("p");
    			if (subtitle_slot_or_fallback) subtitle_slot_or_fallback.c();
    			attr_dev(h3, "class", "section__title svelte-1201taa");
    			add_location(h3, file$h, 6, 2, 126);
    			attr_dev(p, "class", "section__subtitle svelte-1201taa");
    			add_location(p, file$h, 9, 2, 212);
    			attr_dev(div, "class", "section__heading svelte-1201taa");
    			add_location(div, file$h, 5, 0, 92);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);

    			if (title_slot_or_fallback) {
    				title_slot_or_fallback.m(h3, null);
    			}

    			append_dev(div, t);
    			append_dev(div, p);

    			if (subtitle_slot_or_fallback) {
    				subtitle_slot_or_fallback.m(p, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (title_slot) {
    				if (title_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						title_slot,
    						title_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(title_slot_template, /*$$scope*/ ctx[2], dirty, get_title_slot_changes),
    						get_title_slot_context
    					);
    				}
    			} else {
    				if (title_slot_or_fallback && title_slot_or_fallback.p && (!current || dirty & /*sectionTitle*/ 1)) {
    					title_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (subtitle_slot) {
    				if (subtitle_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						subtitle_slot,
    						subtitle_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(subtitle_slot_template, /*$$scope*/ ctx[2], dirty, get_subtitle_slot_changes),
    						get_subtitle_slot_context
    					);
    				}
    			} else {
    				if (subtitle_slot_or_fallback && subtitle_slot_or_fallback.p && (!current || dirty & /*sectionSubtitle*/ 2)) {
    					subtitle_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot_or_fallback, local);
    			transition_in(subtitle_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot_or_fallback, local);
    			transition_out(subtitle_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (title_slot_or_fallback) title_slot_or_fallback.d(detaching);
    			if (subtitle_slot_or_fallback) subtitle_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SectionHeading', slots, ['title','subtitle']);
    	let { sectionTitle = "" } = $$props;
    	let { sectionSubtitle = "" } = $$props;
    	const writable_props = ['sectionTitle', 'sectionSubtitle'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SectionHeading> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('sectionTitle' in $$props) $$invalidate(0, sectionTitle = $$props.sectionTitle);
    		if ('sectionSubtitle' in $$props) $$invalidate(1, sectionSubtitle = $$props.sectionSubtitle);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ sectionTitle, sectionSubtitle });

    	$$self.$inject_state = $$props => {
    		if ('sectionTitle' in $$props) $$invalidate(0, sectionTitle = $$props.sectionTitle);
    		if ('sectionSubtitle' in $$props) $$invalidate(1, sectionSubtitle = $$props.sectionSubtitle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [sectionTitle, sectionSubtitle, $$scope, slots];
    }

    class SectionHeading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { sectionTitle: 0, sectionSubtitle: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SectionHeading",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get sectionTitle() {
    		throw new Error("<SectionHeading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sectionTitle(value) {
    		throw new Error("<SectionHeading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sectionSubtitle() {
    		throw new Error("<SectionHeading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sectionSubtitle(value) {
    		throw new Error("<SectionHeading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Address.svelte generated by Svelte v3.43.2 */
    const file$g = "src\\components\\Address.svelte";

    // (12:8) 
    function create_title_slot$5(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = `${/*sectionTitle*/ ctx[1]}`;
    			attr_dev(span, "slot", "title");
    			add_location(span, file$g, 11, 8, 363);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot$5.name,
    		type: "slot",
    		source: "(12:8) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let section;
    	let div5;
    	let div4;
    	let sectionheading;
    	let t0;
    	let div3;
    	let div2;
    	let div0;
    	let h40;
    	let t2;
    	let p0;
    	let t4;
    	let ul;
    	let li0;
    	let t6;
    	let li1;
    	let t8;
    	let p1;
    	let t10;
    	let a0;
    	let t12;
    	let div1;
    	let h41;
    	let t14;
    	let p2;
    	let t16;
    	let a1;
    	let t18;
    	let a2;
    	let img;
    	let img_src_value;
    	let current;

    	sectionheading = new SectionHeading({
    			props: {
    				$$slots: { title: [create_title_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div5 = element("div");
    			div4 = element("div");
    			create_component(sectionheading.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h40 = element("h4");
    			h40.textContent = "На общестенном транспорте";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Из Нижнего Тагила до горнолыжного комплекса можно доехать на\r\n              автобусах:";
    			t4 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "№ 3 - от железнодорожного вокзала";
    			t6 = space();
    			li1 = element("li");
    			li1.textContent = "№ 19 - от улицы Вогульской";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "До конечной остановки «Пансионат «Аист».";
    			t10 = space();
    			a0 = element("a");
    			a0.textContent = "Посмотреть расписание автобусов";
    			t12 = space();
    			div1 = element("div");
    			h41 = element("h4");
    			h41.textContent = "На личном транспорте";
    			t14 = space();
    			p2 = element("p");
    			p2.textContent = "На личном транспорте нужно двигаться по Серовскому тракту (трасса\r\n              Р352). Проехав указатель поворота в Нижний Тагил и развязку,\r\n              следует повернуть направо. Нужно ориентироваться на указатель\r\n              «Комплекс трамплинов СДЮСШОР «АИСТ», который установлен на\r\n              подъезде к базе.";
    			t16 = space();
    			a1 = element("a");
    			a1.textContent = "Посмотреть маршрут на карте";
    			t18 = space();
    			a2 = element("a");
    			img = element("img");
    			attr_dev(h40, "class", "address-box__title svelte-1ghmze4");
    			add_location(h40, file$g, 17, 12, 552);
    			add_location(p0, file$g, 20, 12, 657);
    			attr_dev(li0, "class", "svelte-1ghmze4");
    			add_location(li0, file$g, 25, 14, 834);
    			attr_dev(li1, "class", "svelte-1ghmze4");
    			add_location(li1, file$g, 26, 14, 892);
    			attr_dev(ul, "class", "marker-list svelte-1ghmze4");
    			add_location(ul, file$g, 24, 12, 794);
    			add_location(p1, file$g, 28, 12, 960);
    			attr_dev(a0, "class", "icon-link calendar-icon svelte-1ghmze4");
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$g, 29, 12, 1021);
    			attr_dev(div0, "class", "address-box svelte-1ghmze4");
    			add_location(div0, file$g, 16, 10, 513);
    			attr_dev(h41, "class", "address-box__title svelte-1ghmze4");
    			add_location(h41, file$g, 34, 12, 1215);
    			add_location(p2, file$g, 37, 12, 1315);
    			attr_dev(a1, "class", "icon-link map-icon svelte-1ghmze4");
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$g, 44, 12, 1690);
    			attr_dev(div1, "class", "address-box svelte-1ghmze4");
    			add_location(div1, file$g, 33, 10, 1176);
    			attr_dev(div2, "class", "address-content svelte-1ghmze4");
    			add_location(div2, file$g, 15, 8, 472);
    			attr_dev(img, "class", "map-image");
    			if (!src_url_equal(img.src, img_src_value = "../content/Address/map.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*sectionTitle*/ ctx[1]);
    			add_location(img, file$g, 50, 10, 1907);
    			attr_dev(a2, "class", "map-link");
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$g, 49, 8, 1850);
    			attr_dev(div3, "class", "text-block svelte-1ghmze4");
    			add_location(div3, file$g, 14, 6, 438);
    			attr_dev(div4, "class", "content svelte-1ghmze4");
    			add_location(div4, file$g, 9, 4, 308);
    			attr_dev(div5, "class", "wrapper");
    			add_location(div5, file$g, 8, 2, 281);
    			attr_dev(section, "class", "section address svelte-1ghmze4");
    			attr_dev(section, "id", "howReach");
    			set_style(section, "background-image", "url(" + /*bgUrl*/ ctx[0] + ")");
    			add_location(section, file$g, 7, 0, 191);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div5);
    			append_dev(div5, div4);
    			mount_component(sectionheading, div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h40);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(div0, t4);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t6);
    			append_dev(ul, li1);
    			append_dev(div0, t8);
    			append_dev(div0, p1);
    			append_dev(div0, t10);
    			append_dev(div0, a0);
    			append_dev(div2, t12);
    			append_dev(div2, div1);
    			append_dev(div1, h41);
    			append_dev(div1, t14);
    			append_dev(div1, p2);
    			append_dev(div1, t16);
    			append_dev(div1, a1);
    			append_dev(div3, t18);
    			append_dev(div3, a2);
    			append_dev(a2, img);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sectionheading_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				sectionheading_changes.$$scope = { dirty, ctx };
    			}

    			sectionheading.$set(sectionheading_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionheading.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheading.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(sectionheading);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Address', slots, []);
    	let bgUrl = "../content/Address/bg.jpg";
    	let sectionTitle = "Как добраться до горнолыжного комплекса";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Address> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SectionHeading, bgUrl, sectionTitle });

    	$$self.$inject_state = $$props => {
    		if ('bgUrl' in $$props) $$invalidate(0, bgUrl = $$props.bgUrl);
    		if ('sectionTitle' in $$props) $$invalidate(1, sectionTitle = $$props.sectionTitle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bgUrl, sectionTitle];
    }

    class Address extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Address",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\components\BackToTop.svelte generated by Svelte v3.43.2 */

    const file$f = "src\\components\\BackToTop.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "images/icons/top.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "24");
    			attr_dev(img, "height", "24");
    			attr_dev(img, "alt", "Наверх");
    			add_location(img, file$f, 7, 2, 150);
    			attr_dev(div, "class", "top svelte-vsolng");
    			add_location(div, file$f, 6, 0, 108);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", backToTop, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function backToTop() {
    	window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BackToTop', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BackToTop> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ backToTop });
    	return [];
    }

    class BackToTop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackToTop",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\components\elements\LogoColor.svelte generated by Svelte v3.43.2 */

    const file$e = "src\\components\\elements\\LogoColor.svelte";

    function create_fragment$f(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", /*width*/ ctx[2]);
    			attr_dev(img, "height", /*height*/ ctx[3]);
    			attr_dev(img, "alt", /*alt*/ ctx[1]);
    			add_location(img, file$e, 7, 0, 155);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*src*/ 1 && !src_url_equal(img.src, img_src_value = /*src*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*width*/ 4) {
    				attr_dev(img, "width", /*width*/ ctx[2]);
    			}

    			if (dirty & /*height*/ 8) {
    				attr_dev(img, "height", /*height*/ ctx[3]);
    			}

    			if (dirty & /*alt*/ 2) {
    				attr_dev(img, "alt", /*alt*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LogoColor', slots, []);
    	let { src = 'images/logo.svg' } = $$props;
    	let { alt = 'Logotype' } = $$props;
    	let { width = 'auto' } = $$props;
    	let { height = 'auto' } = $$props;
    	const writable_props = ['src', 'alt', 'width', 'height'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LogoColor> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('src' in $$props) $$invalidate(0, src = $$props.src);
    		if ('alt' in $$props) $$invalidate(1, alt = $$props.alt);
    		if ('width' in $$props) $$invalidate(2, width = $$props.width);
    		if ('height' in $$props) $$invalidate(3, height = $$props.height);
    	};

    	$$self.$capture_state = () => ({ src, alt, width, height });

    	$$self.$inject_state = $$props => {
    		if ('src' in $$props) $$invalidate(0, src = $$props.src);
    		if ('alt' in $$props) $$invalidate(1, alt = $$props.alt);
    		if ('width' in $$props) $$invalidate(2, width = $$props.width);
    		if ('height' in $$props) $$invalidate(3, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src, alt, width, height];
    }

    class LogoColor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { src: 0, alt: 1, width: 2, height: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LogoColor",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get src() {
    		throw new Error("<LogoColor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<LogoColor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<LogoColor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<LogoColor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<LogoColor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<LogoColor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<LogoColor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<LogoColor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.43.2 */
    const file$d = "src\\components\\Footer.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (85:10) {#each footerMenu as menuItem}
    function create_each_block$4(ctx) {
    	let li;
    	let a;
    	let t0_value = /*menuItem*/ ctx[7].title + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "class", "footer-menu__link");
    			attr_dev(a, "href", /*menuItem*/ ctx[7].url);
    			add_location(a, file$d, 86, 14, 1881);
    			attr_dev(li, "class", "footer-menu__item svelte-1mq16k6");
    			add_location(li, file$d, 85, 12, 1835);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(85:10) {#each footerMenu as menuItem}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let footer;
    	let div3;
    	let div1;
    	let div0;
    	let logocolor;
    	let t0;
    	let span0;
    	let t2;
    	let a0;
    	let t3;
    	let t4;
    	let a1;
    	let t5;
    	let t6;
    	let nav;
    	let ul0;
    	let t7;
    	let ul1;
    	let li0;
    	let a2;
    	let svg0;
    	let path0;
    	let t8;
    	let li1;
    	let a3;
    	let svg1;
    	let path1;
    	let path2;
    	let t9;
    	let li2;
    	let a4;
    	let svg2;
    	let path3;
    	let path4;
    	let path5;
    	let t10;
    	let div2;
    	let span1;
    	let t12;
    	let a5;
    	let t13_value = /*privacy*/ ctx[5].title + "";
    	let t13;
    	let current;
    	const logocolor_spread_levels = [/*logo*/ ctx[0]];
    	let logocolor_props = {};

    	for (let i = 0; i < logocolor_spread_levels.length; i += 1) {
    		logocolor_props = assign(logocolor_props, logocolor_spread_levels[i]);
    	}

    	logocolor = new LogoColor({ props: logocolor_props, $$inline: true });
    	let each_value = /*footerMenu*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(logocolor.$$.fragment);
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = `${/*address*/ ctx[1]}`;
    			t2 = space();
    			a0 = element("a");
    			t3 = text(/*phone*/ ctx[2]);
    			t4 = space();
    			a1 = element("a");
    			t5 = text(/*email*/ ctx[3]);
    			t6 = space();
    			nav = element("nav");
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			ul1 = element("ul");
    			li0 = element("li");
    			a2 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t8 = space();
    			li1 = element("li");
    			a3 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t9 = space();
    			li2 = element("li");
    			a4 = element("a");
    			svg2 = svg_element("svg");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			t10 = space();
    			div2 = element("div");
    			span1 = element("span");
    			span1.textContent = `${/*copyright*/ ctx[4]}`;
    			t12 = space();
    			a5 = element("a");
    			t13 = text(t13_value);
    			attr_dev(span0, "class", "address svelte-1mq16k6");
    			add_location(span0, file$d, 76, 8, 1487);
    			attr_dev(a0, "class", "about-contact phone svelte-1mq16k6");
    			attr_dev(a0, "href", "tel:" + /*phone*/ ctx[2].replace(/\s+/g, ''));
    			add_location(a0, file$d, 77, 8, 1535);
    			attr_dev(a1, "class", "about-contact email svelte-1mq16k6");
    			attr_dev(a1, "href", "mailto:" + /*email*/ ctx[3]);
    			add_location(a1, file$d, 80, 8, 1648);
    			attr_dev(div0, "class", "about svelte-1mq16k6");
    			add_location(div0, file$d, 73, 6, 1344);
    			attr_dev(ul0, "class", "footer-menu__list svelte-1mq16k6");
    			add_location(ul0, file$d, 83, 8, 1749);
    			add_location(nav, file$d, 82, 6, 1734);
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "clip-rule", "evenodd");
    			attr_dev(path0, "d", "M0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16ZM16.8369 21.2507C16.8369 21.2507 17.1449 21.2171 17.3027 21.0508C17.4471 20.8984 17.4421 20.6108 17.4421 20.6108C17.4421 20.6108 17.4229 19.2678 18.0581 19.0695C18.6842 18.8745 19.488 20.3682 20.3411 20.9426C20.9855 21.3769 21.4747 21.2818 21.4747 21.2818L23.7543 21.2507C23.7543 21.2507 24.9463 21.1786 24.3812 20.2584C24.3345 20.1831 24.0515 19.5775 22.6867 18.3337C21.2568 17.0318 21.4488 17.2423 23.17 14.9899C24.2184 13.6183 24.6375 12.7809 24.5064 12.4228C24.382 12.0803 23.6108 12.1713 23.6108 12.1713L21.0448 12.1868C21.0448 12.1868 20.8545 12.1614 20.7134 12.2442C20.5757 12.3253 20.4864 12.5146 20.4864 12.5146C20.4864 12.5146 20.0807 13.5757 19.5389 14.4786C18.3962 16.3828 17.9396 16.4836 17.7526 16.3656C17.3177 16.0895 17.4262 15.2578 17.4262 14.6671C17.4262 12.821 17.7117 12.0516 16.8711 11.8525C16.5923 11.7862 16.387 11.7427 15.6733 11.7354C14.7576 11.7263 13.983 11.7386 13.5439 11.9492C13.2517 12.0893 13.0264 12.4023 13.1641 12.4203C13.3335 12.4425 13.7175 12.5219 13.9212 12.794C14.1841 13.1455 14.175 13.9337 14.175 13.9337C14.175 13.9337 14.326 16.1067 13.8219 16.3763C13.4763 16.5614 13.0022 16.1837 11.9829 14.4557C11.4612 13.5707 11.0672 12.5924 11.0672 12.5924C11.0672 12.5924 10.9913 12.4097 10.8552 12.3114C10.6908 12.1926 10.4612 12.1557 10.4612 12.1557L8.02298 12.1713C8.02298 12.1713 7.65653 12.1811 7.52214 12.3376C7.40278 12.4761 7.51296 12.7637 7.51296 12.7637C7.51296 12.7637 9.42199 17.1481 11.5839 19.3579C13.5664 21.3834 15.8169 21.2507 15.8169 21.2507H16.8369Z");
    			attr_dev(path0, "fill", "#245081");
    			add_location(path0, file$d, 105, 14, 2423);
    			attr_dev(svg0, "class", "social-icon svelte-1mq16k6");
    			attr_dev(svg0, "width", "32");
    			attr_dev(svg0, "height", "32");
    			attr_dev(svg0, "viewBox", "0 0 32 32");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg0, file$d, 96, 12, 2130);
    			attr_dev(a2, "href", "/");
    			add_location(a2, file$d, 95, 10, 2104);
    			add_location(li0, file$d, 94, 8, 2088);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "clip-rule", "evenodd");
    			attr_dev(path1, "d", "M0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16ZM15.9891 16.2569C18.3485 16.2569 20.2664 14.4053 20.2664 12.1291C20.2664 9.85207 18.3485 8 15.9891 8C13.6303 8 11.7119 9.85207 11.7119 12.1291C11.7119 14.4053 13.6303 16.2569 15.9891 16.2569ZM17.7306 19.6269C18.6013 19.4354 19.441 19.1029 20.2144 18.634C20.7997 18.2778 20.976 17.531 20.6072 16.966C20.2387 16.3998 19.4656 16.2293 18.8792 16.5855C17.1272 17.6491 14.8714 17.6488 13.1204 16.5855C12.5341 16.2293 11.7607 16.3998 11.3929 16.966C11.0241 17.5315 11.1999 18.2778 11.7852 18.634C12.5586 19.1024 13.3983 19.4354 14.269 19.6269L11.8776 21.9352C11.3888 22.4076 11.3888 23.1734 11.8781 23.6457C12.1231 23.8817 12.4435 23.9998 12.7639 23.9998C13.0848 23.9998 13.4058 23.8817 13.6507 23.6457L15.9996 21.3774L18.3505 23.6457C18.8393 24.1181 19.6324 24.1181 20.1218 23.6457C20.6116 23.1734 20.6116 22.4071 20.1218 21.9352L17.7306 19.6269Z");
    			attr_dev(path1, "fill", "#245081");
    			add_location(path1, file$d, 125, 14, 4583);
    			attr_dev(path2, "fill-rule", "evenodd");
    			attr_dev(path2, "clip-rule", "evenodd");
    			attr_dev(path2, "d", "M15.9891 10.4198C16.9657 10.4198 17.7601 11.1863 17.7601 12.1291C17.7601 13.071 16.9657 13.8381 15.9891 13.8381C15.0133 13.8381 14.2181 13.071 14.2181 12.1291C14.2181 11.1863 15.0133 10.4198 15.9891 10.4198Z");
    			attr_dev(path2, "fill", "#245081");
    			add_location(path2, file$d, 131, 14, 5702);
    			attr_dev(svg1, "class", "social-icon svelte-1mq16k6");
    			attr_dev(svg1, "width", "32");
    			attr_dev(svg1, "height", "32");
    			attr_dev(svg1, "viewBox", "0 0 32 32");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg1, file$d, 116, 12, 4290);
    			attr_dev(a3, "href", "/");
    			add_location(a3, file$d, 115, 10, 4264);
    			add_location(li1, file$d, 114, 8, 4248);
    			attr_dev(path3, "fill-rule", "evenodd");
    			attr_dev(path3, "clip-rule", "evenodd");
    			attr_dev(path3, "d", "M0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16ZM16.0008 7.46667C13.6833 7.46667 13.3924 7.4768 12.4822 7.51822C11.5737 7.55982 10.9536 7.70365 10.4111 7.91467C9.8498 8.13263 9.37371 8.42419 8.89939 8.89868C8.42472 9.373 8.13316 9.84909 7.91449 10.4102C7.70294 10.9529 7.55893 11.5732 7.51804 12.4813C7.47733 13.3915 7.46667 13.6826 7.46667 16.0001C7.46667 18.3176 7.47698 18.6076 7.51822 19.5178C7.56 20.4263 7.70382 21.0464 7.91467 21.5889C8.13281 22.1502 8.42437 22.6263 8.89886 23.1006C9.373 23.5753 9.84909 23.8675 10.41 24.0855C10.9529 24.2965 11.5732 24.4404 12.4815 24.482C13.3917 24.5234 13.6824 24.5335 15.9997 24.5335C18.3174 24.5335 18.6074 24.5234 19.5176 24.482C20.4261 24.4404 21.0469 24.2965 21.5898 24.0855C22.1509 23.8675 22.6263 23.5753 23.1004 23.1006C23.5751 22.6263 23.8667 22.1502 24.0853 21.5891C24.2951 21.0464 24.4391 20.4261 24.4818 19.518C24.5227 18.6078 24.5333 18.3176 24.5333 16.0001C24.5333 13.6826 24.5227 13.3917 24.4818 12.4815C24.4391 11.573 24.2951 10.9529 24.0853 10.4103C23.8667 9.84909 23.5751 9.373 23.1004 8.89868C22.6258 8.42401 22.1511 8.13245 21.5893 7.91467C21.0453 7.70365 20.4248 7.55982 19.5164 7.51822C18.6062 7.4768 18.3164 7.46667 15.9981 7.46667H16.0008Z");
    			attr_dev(path3, "fill", "#245081");
    			add_location(path3, file$d, 151, 14, 6456);
    			attr_dev(path4, "fill-rule", "evenodd");
    			attr_dev(path4, "clip-rule", "evenodd");
    			attr_dev(path4, "d", "M15.2353 9.00446C15.4625 9.00411 15.716 9.00446 16.0008 9.00446C18.2792 9.00446 18.5493 9.01264 19.449 9.05353C20.281 9.09157 20.7326 9.2306 21.0334 9.3474C21.4316 9.50207 21.7155 9.68696 22.014 9.98563C22.3127 10.2843 22.4976 10.5687 22.6526 10.967C22.7694 11.2674 22.9086 11.719 22.9465 12.551C22.9874 13.4506 22.9963 13.7208 22.9963 15.9981C22.9963 18.2755 22.9874 18.5457 22.9465 19.4453C22.9084 20.2773 22.7694 20.7288 22.6526 21.0293C22.4979 21.4275 22.3127 21.7111 22.014 22.0096C21.7153 22.3082 21.4318 22.4931 21.0334 22.6478C20.7329 22.7651 20.281 22.9038 19.449 22.9418C18.5494 22.9827 18.2792 22.9916 16.0008 22.9916C13.7222 22.9916 13.4522 22.9827 12.5526 22.9418C11.7206 22.9035 11.269 22.7644 10.968 22.6476C10.5698 22.493 10.2854 22.3081 9.98669 22.0094C9.68802 21.7107 9.50313 21.427 9.34811 21.0286C9.23131 20.7281 9.09211 20.2766 9.05424 19.4446C9.01335 18.545 9.00517 18.2748 9.00517 15.996C9.00517 13.7172 9.01335 13.4484 9.05424 12.5489C9.09228 11.7168 9.23131 11.2653 9.34811 10.9645C9.50278 10.5663 9.68802 10.2818 9.98669 9.98314C10.2854 9.68447 10.5698 9.49958 10.968 9.34455C11.2688 9.22722 11.7206 9.08855 12.5526 9.05033C13.3398 9.01477 13.6449 9.0041 15.2353 9.00233V9.00446ZM20.5559 10.4214C19.9905 10.4214 19.5319 10.8795 19.5319 11.445C19.5319 12.0104 19.9905 12.469 20.5559 12.469C21.1212 12.469 21.5799 12.0104 21.5799 11.445C21.5799 10.8797 21.1212 10.4214 20.5559 10.4214ZM16.0008 11.6178C13.5807 11.6178 11.6185 13.58 11.6185 16.0001C11.6185 18.4202 13.5807 20.3815 16.0008 20.3815C18.4209 20.3815 20.3824 18.4202 20.3824 16.0001C20.3824 13.58 18.4209 11.6178 16.0008 11.6178Z");
    			attr_dev(path4, "fill", "#245081");
    			add_location(path4, file$d, 157, 14, 7894);
    			attr_dev(path5, "fill-rule", "evenodd");
    			attr_dev(path5, "clip-rule", "evenodd");
    			attr_dev(path5, "d", "M16.0008 13.1556C17.5717 13.1556 18.8453 14.4291 18.8453 16.0001C18.8453 17.5709 17.5717 18.8446 16.0008 18.8446C14.4298 18.8446 13.1563 17.5709 13.1563 16.0001C13.1563 14.4291 14.4298 13.1556 16.0008 13.1556Z");
    			attr_dev(path5, "fill", "#245081");
    			add_location(path5, file$d, 163, 14, 9675);
    			attr_dev(svg2, "class", "social-icon svelte-1mq16k6");
    			attr_dev(svg2, "width", "32");
    			attr_dev(svg2, "height", "32");
    			attr_dev(svg2, "viewBox", "0 0 32 32");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			add_location(svg2, file$d, 142, 12, 6163);
    			attr_dev(a4, "href", "/");
    			add_location(a4, file$d, 141, 10, 6137);
    			add_location(li2, file$d, 140, 8, 6121);
    			attr_dev(ul1, "class", "social svelte-1mq16k6");
    			add_location(ul1, file$d, 93, 6, 2059);
    			attr_dev(div1, "class", "content svelte-1mq16k6");
    			add_location(div1, file$d, 72, 4, 1315);
    			add_location(span1, file$d, 175, 6, 10143);
    			attr_dev(a5, "class", "privacy svelte-1mq16k6");
    			attr_dev(a5, "href", /*privacy*/ ctx[5].url);
    			add_location(a5, file$d, 176, 6, 10175);
    			attr_dev(div2, "class", "copy svelte-1mq16k6");
    			add_location(div2, file$d, 174, 4, 10117);
    			attr_dev(div3, "class", "wrapper");
    			add_location(div3, file$d, 71, 2, 1288);
    			attr_dev(footer, "class", "footer svelte-1mq16k6");
    			add_location(footer, file$d, 70, 0, 1261);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			mount_component(logocolor, div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(div0, t2);
    			append_dev(div0, a0);
    			append_dev(a0, t3);
    			append_dev(div0, t4);
    			append_dev(div0, a1);
    			append_dev(a1, t5);
    			append_dev(div1, t6);
    			append_dev(div1, nav);
    			append_dev(nav, ul0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul0, null);
    			}

    			append_dev(div1, t7);
    			append_dev(div1, ul1);
    			append_dev(ul1, li0);
    			append_dev(li0, a2);
    			append_dev(a2, svg0);
    			append_dev(svg0, path0);
    			append_dev(ul1, t8);
    			append_dev(ul1, li1);
    			append_dev(li1, a3);
    			append_dev(a3, svg1);
    			append_dev(svg1, path1);
    			append_dev(svg1, path2);
    			append_dev(ul1, t9);
    			append_dev(ul1, li2);
    			append_dev(li2, a4);
    			append_dev(a4, svg2);
    			append_dev(svg2, path3);
    			append_dev(svg2, path4);
    			append_dev(svg2, path5);
    			append_dev(div3, t10);
    			append_dev(div3, div2);
    			append_dev(div2, span1);
    			append_dev(div2, t12);
    			append_dev(div2, a5);
    			append_dev(a5, t13);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const logocolor_changes = (dirty & /*logo*/ 1)
    			? get_spread_update(logocolor_spread_levels, [get_spread_object(/*logo*/ ctx[0])])
    			: {};

    			logocolor.$set(logocolor_changes);

    			if (dirty & /*footerMenu*/ 64) {
    				each_value = /*footerMenu*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logocolor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logocolor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_component(logocolor);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);

    	const logo = {
    		width: "75",
    		height: "80",
    		alt: 'Гора Долгая'
    	};

    	let address = "г. Нижний Тагил, улица Долгая, д.1";
    	let phone = "+7 3435 41 81 17";
    	let email = "info@aist-tramplin.ru";
    	let copyright = "© ГЛК «гора Долгая», 2021";

    	let privacy = {
    		url: "#",
    		title: "Политика конфиденциальности"
    	};

    	let footerMenu = [
    		{ title: "Главная", url: "#" },
    		{ title: "Спортивный комплекс", url: "#" },
    		{ title: "Соревнования", url: "#" },
    		{ title: "Услуги", url: "#" },
    		{ title: "О нас", url: "#" },
    		{ title: "Контакты", url: "#" },
    		{ title: "Карта сайта", url: "#" },
    		{
    			title: "Бесплатная юридическая помощь",
    			url: "#"
    		},
    		{ title: "Юридические клиники", url: "#" },
    		{
    			title: "Противодействие коррупции",
    			url: "#"
    		},
    		{ title: "«Горячая линия» ФАДН", url: "#" },
    		{
    			title: "Министерство спорта Свердловской области",
    			url: "#"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		LogoColor,
    		logo,
    		address,
    		phone,
    		email,
    		copyright,
    		privacy,
    		footerMenu
    	});

    	$$self.$inject_state = $$props => {
    		if ('address' in $$props) $$invalidate(1, address = $$props.address);
    		if ('phone' in $$props) $$invalidate(2, phone = $$props.phone);
    		if ('email' in $$props) $$invalidate(3, email = $$props.email);
    		if ('copyright' in $$props) $$invalidate(4, copyright = $$props.copyright);
    		if ('privacy' in $$props) $$invalidate(5, privacy = $$props.privacy);
    		if ('footerMenu' in $$props) $$invalidate(6, footerMenu = $$props.footerMenu);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [logo, address, phone, email, copyright, privacy, footerMenu];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\components\GuestHouses.svelte generated by Svelte v3.43.2 */

    const file$c = "src\\components\\GuestHouses.svelte";

    function create_fragment$d(ctx) {
    	let section;
    	let div1;
    	let article;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let h3;
    	let t2;
    	let p0;
    	let t4;
    	let ul;
    	let li0;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let span1;
    	let t6;
    	let span0;
    	let t8;
    	let span2;
    	let t9;
    	let span3;
    	let t11;
    	let li1;
    	let img2;
    	let img2_src_value;
    	let t12;
    	let span5;
    	let t13;
    	let span4;
    	let t15;
    	let span6;
    	let t16;
    	let span7;
    	let t18;
    	let li2;
    	let img3;
    	let img3_src_value;
    	let t19;
    	let span9;
    	let t20;
    	let span8;
    	let t22;
    	let span10;
    	let t23;
    	let span11;
    	let t25;
    	let p1;
    	let t27;
    	let a;
    	let t29;
    	let img4;
    	let img4_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			article = element("article");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			h3 = element("h3");
    			h3.textContent = `${/*sectionTitle*/ ctx[1]}`;
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "На территории базы находятся 3 гостевых дома.";
    			t4 = space();
    			ul = element("ul");
    			li0 = element("li");
    			img1 = element("img");
    			t5 = space();
    			span1 = element("span");
    			t6 = text("одноэтажный дом \"Эконом\"\r\n              ");
    			span0 = element("span");
    			span0.textContent = "/ 7 чел.";
    			t8 = space();
    			span2 = element("span");
    			t9 = space();
    			span3 = element("span");
    			span3.textContent = "8.400 ₽/сутки";
    			t11 = space();
    			li1 = element("li");
    			img2 = element("img");
    			t12 = space();
    			span5 = element("span");
    			t13 = text("двухэтажный дом \"Ирэна-2\"\r\n              ");
    			span4 = element("span");
    			span4.textContent = "/ 9 чел.";
    			t15 = space();
    			span6 = element("span");
    			t16 = space();
    			span7 = element("span");
    			span7.textContent = "10.800 ₽/сутки";
    			t18 = space();
    			li2 = element("li");
    			img3 = element("img");
    			t19 = space();
    			span9 = element("span");
    			t20 = text("двухэтажный дом \"Ирэна-1\" VIP\r\n              ");
    			span8 = element("span");
    			span8.textContent = "/ 9 чел.";
    			t22 = space();
    			span10 = element("span");
    			t23 = space();
    			span11 = element("span");
    			span11.textContent = "12.600 ₽/сутки";
    			t25 = space();
    			p1 = element("p");
    			p1.textContent = "В каждом доме имеется кухня с большим обеденным столом,\r\n          укомплектованная всем необходимым для самостоятельного приготовления\r\n          пищи, просторная гостиная с мягкой мебелью, телевизором, 4 спальных\r\n          комнаты, санузел с душевой кабиной на каждом этаже.";
    			t27 = space();
    			a = element("a");
    			a.textContent = "Подробнее";
    			t29 = space();
    			img4 = element("img");
    			attr_dev(img0, "class", "text-block-bg svelte-ywyavb");
    			if (!src_url_equal(img0.src, img0_src_value = "../content/GuestHouses/pencil-image.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$c, 9, 8, 285);
    			attr_dev(h3, "class", "section__title svelte-ywyavb");
    			add_location(h3, file$c, 14, 8, 419);
    			attr_dev(p0, "class", "svelte-ywyavb");
    			add_location(p0, file$c, 15, 8, 475);
    			attr_dev(img1, "class", "houses__icon svelte-ywyavb");
    			if (!src_url_equal(img1.src, img1_src_value = "../content/GuestHouses/home-1.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$c, 19, 12, 615);
    			attr_dev(span0, "class", "houses__count svelte-ywyavb");
    			add_location(span0, file$c, 26, 14, 846);
    			attr_dev(span1, "class", "houses__title");
    			add_location(span1, file$c, 24, 12, 762);
    			attr_dev(span2, "class", "houses__dots svelte-ywyavb");
    			add_location(span2, file$c, 28, 12, 925);
    			attr_dev(span3, "class", "houses__price svelte-ywyavb");
    			add_location(span3, file$c, 29, 12, 968);
    			attr_dev(li0, "class", "houses__item svelte-ywyavb");
    			add_location(li0, file$c, 18, 10, 576);
    			attr_dev(img2, "class", "houses__icon svelte-ywyavb");
    			if (!src_url_equal(img2.src, img2_src_value = "../content/GuestHouses/home-2.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$c, 33, 12, 1086);
    			attr_dev(span4, "class", "houses__count svelte-ywyavb");
    			add_location(span4, file$c, 40, 14, 1318);
    			attr_dev(span5, "class", "houses__title");
    			add_location(span5, file$c, 38, 12, 1233);
    			attr_dev(span6, "class", "houses__dots svelte-ywyavb");
    			add_location(span6, file$c, 42, 12, 1397);
    			attr_dev(span7, "class", "houses__price svelte-ywyavb");
    			add_location(span7, file$c, 43, 12, 1440);
    			attr_dev(li1, "class", "houses__item svelte-ywyavb");
    			add_location(li1, file$c, 32, 10, 1047);
    			attr_dev(img3, "class", "houses__icon svelte-ywyavb");
    			if (!src_url_equal(img3.src, img3_src_value = "../content/GuestHouses/home-2.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$c, 47, 12, 1559);
    			attr_dev(span8, "class", "houses__count svelte-ywyavb");
    			add_location(span8, file$c, 54, 14, 1795);
    			attr_dev(span9, "class", "houses__title");
    			add_location(span9, file$c, 52, 12, 1706);
    			attr_dev(span10, "class", "houses__dots svelte-ywyavb");
    			add_location(span10, file$c, 56, 12, 1874);
    			attr_dev(span11, "class", "houses__price svelte-ywyavb");
    			add_location(span11, file$c, 57, 12, 1917);
    			attr_dev(li2, "class", "houses__item svelte-ywyavb");
    			add_location(li2, file$c, 46, 10, 1520);
    			attr_dev(ul, "class", "houses__list svelte-ywyavb");
    			add_location(ul, file$c, 17, 8, 539);
    			attr_dev(p1, "class", "svelte-ywyavb");
    			add_location(p1, file$c, 61, 8, 2010);
    			attr_dev(a, "class", "more-link svelte-ywyavb");
    			attr_dev(a, "href", "/");
    			add_location(a, file$c, 67, 8, 2326);
    			attr_dev(div0, "class", "text-block svelte-ywyavb");
    			add_location(div0, file$c, 8, 6, 251);
    			attr_dev(img4, "class", "image svelte-ywyavb");
    			if (!src_url_equal(img4.src, img4_src_value = "../content/GuestHouses/content-image.jpg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			add_location(img4, file$c, 69, 6, 2391);
    			attr_dev(article, "class", "content svelte-ywyavb");
    			add_location(article, file$c, 7, 4, 218);
    			attr_dev(div1, "class", "wrapper");
    			add_location(div1, file$c, 6, 2, 191);
    			attr_dev(section, "class", "section guest-houses svelte-ywyavb");
    			set_style(section, "background-image", "url(" + /*bgUrl*/ ctx[0] + ")");
    			add_location(section, file$c, 5, 0, 110);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, article);
    			append_dev(article, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, h3);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(div0, t4);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, img1);
    			append_dev(li0, t5);
    			append_dev(li0, span1);
    			append_dev(span1, t6);
    			append_dev(span1, span0);
    			append_dev(li0, t8);
    			append_dev(li0, span2);
    			append_dev(li0, t9);
    			append_dev(li0, span3);
    			append_dev(ul, t11);
    			append_dev(ul, li1);
    			append_dev(li1, img2);
    			append_dev(li1, t12);
    			append_dev(li1, span5);
    			append_dev(span5, t13);
    			append_dev(span5, span4);
    			append_dev(li1, t15);
    			append_dev(li1, span6);
    			append_dev(li1, t16);
    			append_dev(li1, span7);
    			append_dev(ul, t18);
    			append_dev(ul, li2);
    			append_dev(li2, img3);
    			append_dev(li2, t19);
    			append_dev(li2, span9);
    			append_dev(span9, t20);
    			append_dev(span9, span8);
    			append_dev(li2, t22);
    			append_dev(li2, span10);
    			append_dev(li2, t23);
    			append_dev(li2, span11);
    			append_dev(div0, t25);
    			append_dev(div0, p1);
    			append_dev(div0, t27);
    			append_dev(div0, a);
    			append_dev(article, t29);
    			append_dev(article, img4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GuestHouses', slots, []);
    	let bgUrl = "../content/GuestHouses/bg.jpg";
    	let sectionTitle = "Гостевые дома";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GuestHouses> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ bgUrl, sectionTitle });

    	$$self.$inject_state = $$props => {
    		if ('bgUrl' in $$props) $$invalidate(0, bgUrl = $$props.bgUrl);
    		if ('sectionTitle' in $$props) $$invalidate(1, sectionTitle = $$props.sectionTitle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bgUrl, sectionTitle];
    }

    class GuestHouses extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GuestHouses",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\components\Hotel.svelte generated by Svelte v3.43.2 */

    const file$b = "src\\components\\Hotel.svelte";

    function create_fragment$c(ctx) {
    	let section;
    	let div1;
    	let article;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let h3;
    	let t2;
    	let p0;
    	let t4;
    	let ul;
    	let li0;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let span0;
    	let t7;
    	let span1;
    	let t8;
    	let span2;
    	let t10;
    	let li1;
    	let img2;
    	let img2_src_value;
    	let t11;
    	let span3;
    	let t13;
    	let span4;
    	let t14;
    	let span5;
    	let t16;
    	let li2;
    	let img3;
    	let img3_src_value;
    	let t17;
    	let span6;
    	let t19;
    	let span7;
    	let t20;
    	let span8;
    	let t22;
    	let li3;
    	let img4;
    	let img4_src_value;
    	let t23;
    	let span9;
    	let t25;
    	let span10;
    	let t26;
    	let span11;
    	let t28;
    	let li4;
    	let img5;
    	let img5_src_value;
    	let t29;
    	let span12;
    	let t31;
    	let span13;
    	let t32;
    	let span14;
    	let t34;
    	let p1;
    	let t36;
    	let a;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			article = element("article");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = `${/*sectionTitle*/ ctx[1]}`;
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Номерной фонд гостиницы насчитывает 37 номеров (132 места). Здесь\r\n          имеются 1-, 2-, 3-, 4-местные комнаты и номера-люкс.";
    			t4 = space();
    			ul = element("ul");
    			li0 = element("li");
    			img1 = element("img");
    			t5 = space();
    			span0 = element("span");
    			span0.textContent = "1 местный номер";
    			t7 = space();
    			span1 = element("span");
    			t8 = space();
    			span2 = element("span");
    			span2.textContent = "2.300 ₽";
    			t10 = space();
    			li1 = element("li");
    			img2 = element("img");
    			t11 = space();
    			span3 = element("span");
    			span3.textContent = "2-х местный номер";
    			t13 = space();
    			span4 = element("span");
    			t14 = space();
    			span5 = element("span");
    			span5.textContent = "700 ₽";
    			t16 = space();
    			li2 = element("li");
    			img3 = element("img");
    			t17 = space();
    			span6 = element("span");
    			span6.textContent = "3-х местный номер";
    			t19 = space();
    			span7 = element("span");
    			t20 = space();
    			span8 = element("span");
    			span8.textContent = "550 ₽";
    			t22 = space();
    			li3 = element("li");
    			img4 = element("img");
    			t23 = space();
    			span9 = element("span");
    			span9.textContent = "4-х местный номер";
    			t25 = space();
    			span10 = element("span");
    			t26 = space();
    			span11 = element("span");
    			span11.textContent = "900 ₽";
    			t28 = space();
    			li4 = element("li");
    			img5 = element("img");
    			t29 = space();
    			span12 = element("span");
    			span12.textContent = "Номер — люкс";
    			t31 = space();
    			span13 = element("span");
    			t32 = space();
    			span14 = element("span");
    			span14.textContent = "3.700 ₽";
    			t34 = space();
    			p1 = element("p");
    			p1.textContent = "Номера имеют все необходимое для полноценного досуга, работы или\r\n          отдыха. Красивый вид на зеленую зону, современная техника, светлый тон\r\n          интерьера, идеально сочетающийся с темными цветами оригинальной мебели\r\n          – все это создает необходимый уровень комфорта для каждого гостя.";
    			t36 = space();
    			a = element("a");
    			a.textContent = "Подробнее";
    			attr_dev(img0, "class", "image svelte-k69dlo");
    			if (!src_url_equal(img0.src, img0_src_value = "../content/Hotel/content-image.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$b, 8, 6, 234);
    			attr_dev(h3, "class", "section__title svelte-k69dlo");
    			add_location(h3, file$b, 14, 8, 379);
    			add_location(p0, file$b, 15, 8, 435);
    			attr_dev(img1, "class", "rooms__icon svelte-k69dlo");
    			if (!src_url_equal(img1.src, img1_src_value = "../content/Hotel/room-1.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$b, 22, 12, 679);
    			attr_dev(span0, "class", "rooms__title");
    			add_location(span0, file$b, 23, 12, 761);
    			attr_dev(span1, "class", "rooms__dots svelte-k69dlo");
    			add_location(span1, file$b, 24, 12, 824);
    			attr_dev(span2, "class", "rooms__price svelte-k69dlo");
    			add_location(span2, file$b, 25, 12, 866);
    			attr_dev(li0, "class", "rooms__item svelte-k69dlo");
    			add_location(li0, file$b, 21, 10, 641);
    			attr_dev(img2, "class", "rooms__icon svelte-k69dlo");
    			if (!src_url_equal(img2.src, img2_src_value = "../content/Hotel/room-2.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$b, 29, 12, 976);
    			attr_dev(span3, "class", "rooms__title");
    			add_location(span3, file$b, 30, 12, 1058);
    			attr_dev(span4, "class", "rooms__dots svelte-k69dlo");
    			add_location(span4, file$b, 31, 12, 1123);
    			attr_dev(span5, "class", "rooms__price svelte-k69dlo");
    			add_location(span5, file$b, 32, 12, 1165);
    			attr_dev(li1, "class", "rooms__item svelte-k69dlo");
    			add_location(li1, file$b, 28, 10, 938);
    			attr_dev(img3, "class", "rooms__icon svelte-k69dlo");
    			if (!src_url_equal(img3.src, img3_src_value = "../content/Hotel/room-3.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$b, 36, 12, 1273);
    			attr_dev(span6, "class", "rooms__title");
    			add_location(span6, file$b, 37, 12, 1355);
    			attr_dev(span7, "class", "rooms__dots svelte-k69dlo");
    			add_location(span7, file$b, 38, 12, 1420);
    			attr_dev(span8, "class", "rooms__price svelte-k69dlo");
    			add_location(span8, file$b, 39, 12, 1462);
    			attr_dev(li2, "class", "rooms__item svelte-k69dlo");
    			add_location(li2, file$b, 35, 10, 1235);
    			attr_dev(img4, "class", "rooms__icon svelte-k69dlo");
    			if (!src_url_equal(img4.src, img4_src_value = "../content/Hotel/room-4.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			add_location(img4, file$b, 43, 12, 1570);
    			attr_dev(span9, "class", "rooms__title");
    			add_location(span9, file$b, 44, 12, 1652);
    			attr_dev(span10, "class", "rooms__dots svelte-k69dlo");
    			add_location(span10, file$b, 45, 12, 1717);
    			attr_dev(span11, "class", "rooms__price svelte-k69dlo");
    			add_location(span11, file$b, 46, 12, 1759);
    			attr_dev(li3, "class", "rooms__item svelte-k69dlo");
    			add_location(li3, file$b, 42, 10, 1532);
    			attr_dev(img5, "class", "rooms__icon svelte-k69dlo");
    			if (!src_url_equal(img5.src, img5_src_value = "../content/Hotel/room-lux.svg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			add_location(img5, file$b, 50, 12, 1867);
    			attr_dev(span12, "class", "rooms__title");
    			add_location(span12, file$b, 55, 12, 2009);
    			attr_dev(span13, "class", "rooms__dots svelte-k69dlo");
    			add_location(span13, file$b, 56, 12, 2069);
    			attr_dev(span14, "class", "rooms__price svelte-k69dlo");
    			add_location(span14, file$b, 57, 12, 2111);
    			attr_dev(li4, "class", "rooms__item svelte-k69dlo");
    			add_location(li4, file$b, 49, 10, 1829);
    			attr_dev(ul, "class", "rooms__list svelte-k69dlo");
    			add_location(ul, file$b, 20, 8, 605);
    			add_location(p1, file$b, 61, 8, 2196);
    			attr_dev(a, "class", "more-link svelte-k69dlo");
    			attr_dev(a, "href", "/");
    			add_location(a, file$b, 67, 8, 2540);
    			attr_dev(div0, "class", "text-block svelte-k69dlo");
    			add_location(div0, file$b, 13, 6, 345);
    			attr_dev(article, "class", "content svelte-k69dlo");
    			add_location(article, file$b, 7, 4, 201);
    			attr_dev(div1, "class", "wrapper");
    			add_location(div1, file$b, 6, 2, 174);
    			attr_dev(section, "class", "section hotel svelte-k69dlo");
    			set_style(section, "background-image", "url(" + /*bgUrl*/ ctx[0] + ")");
    			add_location(section, file$b, 5, 0, 100);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, article);
    			append_dev(article, img0);
    			append_dev(article, t0);
    			append_dev(article, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(div0, t4);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, img1);
    			append_dev(li0, t5);
    			append_dev(li0, span0);
    			append_dev(li0, t7);
    			append_dev(li0, span1);
    			append_dev(li0, t8);
    			append_dev(li0, span2);
    			append_dev(ul, t10);
    			append_dev(ul, li1);
    			append_dev(li1, img2);
    			append_dev(li1, t11);
    			append_dev(li1, span3);
    			append_dev(li1, t13);
    			append_dev(li1, span4);
    			append_dev(li1, t14);
    			append_dev(li1, span5);
    			append_dev(ul, t16);
    			append_dev(ul, li2);
    			append_dev(li2, img3);
    			append_dev(li2, t17);
    			append_dev(li2, span6);
    			append_dev(li2, t19);
    			append_dev(li2, span7);
    			append_dev(li2, t20);
    			append_dev(li2, span8);
    			append_dev(ul, t22);
    			append_dev(ul, li3);
    			append_dev(li3, img4);
    			append_dev(li3, t23);
    			append_dev(li3, span9);
    			append_dev(li3, t25);
    			append_dev(li3, span10);
    			append_dev(li3, t26);
    			append_dev(li3, span11);
    			append_dev(ul, t28);
    			append_dev(ul, li4);
    			append_dev(li4, img5);
    			append_dev(li4, t29);
    			append_dev(li4, span12);
    			append_dev(li4, t31);
    			append_dev(li4, span13);
    			append_dev(li4, t32);
    			append_dev(li4, span14);
    			append_dev(div0, t34);
    			append_dev(div0, p1);
    			append_dev(div0, t36);
    			append_dev(div0, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hotel', slots, []);
    	let bgUrl = "../content/Hotel/bg.jpg";
    	let sectionTitle = "Гостиница";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hotel> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ bgUrl, sectionTitle });

    	$$self.$inject_state = $$props => {
    		if ('bgUrl' in $$props) $$invalidate(0, bgUrl = $$props.bgUrl);
    		if ('sectionTitle' in $$props) $$invalidate(1, sectionTitle = $$props.sectionTitle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bgUrl, sectionTitle];
    }

    class Hotel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hotel",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\components\HotelComplex.svelte generated by Svelte v3.43.2 */
    const file$a = "src\\components\\HotelComplex.svelte";

    // (14:6) 
    function create_title_slot$4(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = `${/*sectionTitle*/ ctx[0]}`;
    			attr_dev(span, "slot", "title");
    			add_location(span, file$a, 13, 6, 509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot$4.name,
    		type: "slot",
    		source: "(14:6) ",
    		ctx
    	});

    	return block;
    }

    // (15:6) 
    function create_subtitle_slot$2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = `${/*sectionSubtitle*/ ctx[1]}`;
    			attr_dev(span, "slot", "subtitle");
    			add_location(span, file$a, 14, 6, 557);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_subtitle_slot$2.name,
    		type: "slot",
    		source: "(15:6) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let section;
    	let div;
    	let sectionheading;
    	let t0;
    	let hotel;
    	let t1;
    	let guesthouses;
    	let current;

    	sectionheading = new SectionHeading({
    			props: {
    				$$slots: {
    					subtitle: [create_subtitle_slot$2],
    					title: [create_title_slot$4]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	hotel = new Hotel({ $$inline: true });
    	guesthouses = new GuestHouses({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			create_component(sectionheading.$$.fragment);
    			t0 = space();
    			create_component(hotel.$$.fragment);
    			t1 = space();
    			create_component(guesthouses.$$.fragment);
    			attr_dev(div, "class", "wrapper");
    			add_location(div, file$a, 11, 2, 458);
    			attr_dev(section, "class", "section");
    			attr_dev(section, "id", "hotelComplex");
    			add_location(section, file$a, 10, 0, 411);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			mount_component(sectionheading, div, null);
    			append_dev(section, t0);
    			mount_component(hotel, section, null);
    			append_dev(section, t1);
    			mount_component(guesthouses, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sectionheading_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				sectionheading_changes.$$scope = { dirty, ctx };
    			}

    			sectionheading.$set(sectionheading_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionheading.$$.fragment, local);
    			transition_in(hotel.$$.fragment, local);
    			transition_in(guesthouses.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheading.$$.fragment, local);
    			transition_out(hotel.$$.fragment, local);
    			transition_out(guesthouses.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(sectionheading);
    			destroy_component(hotel);
    			destroy_component(guesthouses);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HotelComplex', slots, []);
    	let sectionTitle = "Гостиничный комплекс";
    	let sectionSubtitle = "Горнолыжный комплекс располагает достаточной базой для размещения туристов и лыжников. Для проживания гости могут выбрать номер в гостинице или гостевой домик.";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HotelComplex> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		GuestHouses,
    		Hotel,
    		SectionHeading,
    		sectionTitle,
    		sectionSubtitle
    	});

    	$$self.$inject_state = $$props => {
    		if ('sectionTitle' in $$props) $$invalidate(0, sectionTitle = $$props.sectionTitle);
    		if ('sectionSubtitle' in $$props) $$invalidate(1, sectionSubtitle = $$props.sectionSubtitle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [sectionTitle, sectionSubtitle];
    }

    class HotelComplex extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HotelComplex",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\AsideMenu.svelte generated by Svelte v3.43.2 */

    const file$9 = "src\\components\\AsideMenu.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (71:10) {#if item.links}
    function create_if_block$2(ctx) {
    	let ul;
    	let each_value_1 = /*item*/ ctx[1].links;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "nav__list svelte-1p60ri6");
    			add_location(ul, file$9, 71, 12, 1725);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*list*/ 1) {
    				each_value_1 = /*item*/ ctx[1].links;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(71:10) {#if item.links}",
    		ctx
    	});

    	return block;
    }

    // (73:14) {#each item.links as link}
    function create_each_block_1(ctx) {
    	let li;
    	let a;
    	let t0_value = /*link*/ ctx[4] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-1p60ri6");
    			add_location(a, file$9, 74, 18, 1854);
    			attr_dev(li, "class", "nav__list-item svelte-1p60ri6");
    			add_location(li, file$9, 73, 16, 1807);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(73:14) {#each item.links as link}",
    		ctx
    	});

    	return block;
    }

    // (66:6) {#each list as item}
    function create_each_block$3(ctx) {
    	let div;
    	let p;
    	let a;
    	let t0_value = /*item*/ ctx[1].title + "";
    	let t0;
    	let t1;
    	let t2;
    	let if_block = /*item*/ ctx[1].links && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(a, "class", "nav__heading-link svelte-1p60ri6");
    			attr_dev(a, "href", "/");
    			add_location(a, file$9, 68, 12, 1613);
    			attr_dev(p, "class", "nav__heading svelte-1p60ri6");
    			add_location(p, file$9, 67, 10, 1575);
    			attr_dev(div, "class", "nav svelte-1p60ri6");
    			add_location(div, file$9, 66, 8, 1546);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, a);
    			append_dev(a, t0);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[1].links) if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(66:6) {#each list as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let each_value = /*list*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "content svelte-1p60ri6");
    			add_location(div0, file$9, 64, 4, 1487);
    			attr_dev(div1, "class", "wrapper");
    			add_location(div1, file$9, 63, 2, 1460);
    			attr_dev(div2, "class", "box svelte-1p60ri6");
    			add_location(div2, file$9, 62, 0, 1439);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*list*/ 1) {
    				each_value = /*list*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AsideMenu', slots, []);

    	let list = [
    		{
    			title: "Спортивная школа",
    			links: [
    				"Сведения об организации спортивной подготовки",
    				"Условия зачисления в школу",
    				"График работы",
    				"Контакты",
    				"Отделения",
    				"Спортсмены",
    				"Сотрудники",
    				"Наблюдательный совет",
    				"Антидопинг",
    				"Вакансии",
    				"Государственное задание",
    				"Материально техническое обеспечение",
    				"Спонсоры и партнеры",
    				"Закупки",
    				"Перечень рекомендуемых образовательных программ",
    				"Профилактика",
    				"Аренда"
    			]
    		},
    		{
    			title: "Каталог услуг",
    			links: [
    				"Платные услуги",
    				"Спортивные площадки",
    				"Подарочные сертификаты",
    				"Экскурсии на трамплины",
    				"Гостиничный комплекс",
    				"Гостевые домики",
    				"Беседки",
    				"Баня-сауна"
    			]
    		},
    		{
    			title: "Спортивный коплекс",
    			links: [
    				"Трамплины",
    				"Горнолыжные трассы",
    				"Лыжный стадион",
    				"Стрелковый стенд",
    				"Правила пользования сноутюбингом",
    				"Правила работы горнолыжного проката"
    			]
    		},
    		{
    			title: "Соревнования",
    			links: ["Календарь соревнований", "Результаты соревнований", "Фотоальбомы"]
    		},
    		{ title: "Новости" }
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AsideMenu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ list });

    	$$self.$inject_state = $$props => {
    		if ('list' in $$props) $$invalidate(0, list = $$props.list);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [list];
    }

    class AsideMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AsideMenu",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let currentToggle = writable(false);

    /* src\components\elements\BurgerMenuButton.svelte generated by Svelte v3.43.2 */
    const file$8 = "src\\components\\elements\\BurgerMenuButton.svelte";

    function create_fragment$9(ctx) {
    	let button;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			attr_dev(span, "class", "menu-button__lines svelte-16qda85");
    			toggle_class(span, "toggle", /*toggle*/ ctx[0]);
    			add_location(span, file$8, 9, 2, 194);
    			attr_dev(button, "class", "menu-button svelte-16qda85");
    			add_location(button, file$8, 8, 0, 153);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*toggle*/ 1) {
    				toggle_class(span, "toggle", /*toggle*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BurgerMenuButton', slots, []);
    	let toggle;
    	currentToggle.subscribe(newValue => $$invalidate(0, toggle = newValue));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BurgerMenuButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$capture_state = () => ({ currentToggle, toggle });

    	$$self.$inject_state = $$props => {
    		if ('toggle' in $$props) $$invalidate(0, toggle = $$props.toggle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [toggle, click_handler];
    }

    class BurgerMenuButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BurgerMenuButton",
    			options,
    			id: create_fragment$9.name
    		});
    	}
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

    /* src\components\Header.svelte generated by Svelte v3.43.2 */
    const file$7 = "src\\components\\Header.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (46:10) {#each menuItems as menuItem}
    function create_each_block$2(ctx) {
    	let li;
    	let a;
    	let t0_value = /*menuItem*/ ctx[6].title + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "class", "menu__link svelte-efysdv");
    			attr_dev(a, "href", /*menuItem*/ ctx[6].url);
    			add_location(a, file$7, 47, 14, 1338);
    			attr_dev(li, "class", "menu__item");
    			add_location(li, file$7, 46, 12, 1299);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*link*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(46:10) {#each menuItems as menuItem}",
    		ctx
    	});

    	return block;
    }

    // (61:0) {#if toggle}
    function create_if_block$1(ctx) {
    	let div;
    	let asidemenu;
    	let div_outro;
    	let current;
    	asidemenu = new AsideMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(asidemenu.$$.fragment);
    			add_location(div, file$7, 61, 2, 1624);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(asidemenu, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(asidemenu.$$.fragment, local);
    			if (div_outro) div_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(asidemenu.$$.fragment, local);
    			div_outro = create_out_transition(div, fade, { duration: 300 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(asidemenu);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(61:0) {#if toggle}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let header;
    	let div1;
    	let div0;
    	let a;
    	let img;
    	let img_src_value;
    	let t0;
    	let nav;
    	let ul;
    	let t1;
    	let burgermenubutton;
    	let t2;
    	let if_block_anchor;
    	let current;
    	let each_value = /*menuItems*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	burgermenubutton = new BurgerMenuButton({ $$inline: true });
    	burgermenubutton.$on("click", /*toggleMenu*/ ctx[3]);
    	let if_block = /*toggle*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			create_component(burgermenubutton.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[4])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*altLogo*/ ctx[0]);
    			add_location(img, file$7, 40, 8, 1144);
    			attr_dev(a, "class", "logo");
    			attr_dev(a, "href", "/");
    			add_location(a, file$7, 39, 6, 1109);
    			attr_dev(ul, "class", "menu__list svelte-efysdv");
    			add_location(ul, file$7, 44, 8, 1221);
    			attr_dev(nav, "class", "menu svelte-efysdv");
    			add_location(nav, file$7, 43, 6, 1193);
    			attr_dev(div0, "class", "header-inner svelte-efysdv");
    			add_location(div0, file$7, 38, 4, 1075);
    			attr_dev(div1, "class", "wrapper");
    			add_location(div1, file$7, 37, 2, 1048);
    			attr_dev(header, "class", "header svelte-efysdv");
    			add_location(header, file$7, 36, 0, 1021);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, img);
    			append_dev(div0, t0);
    			append_dev(div0, nav);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(nav, t1);
    			mount_component(burgermenubutton, nav, null);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*altLogo*/ 1) {
    				attr_dev(img, "alt", /*altLogo*/ ctx[0]);
    			}

    			if (dirty & /*menuItems, link*/ 36) {
    				each_value = /*menuItems*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*toggle*/ ctx[1]) {
    				if (if_block) {
    					if (dirty & /*toggle*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			transition_in(burgermenubutton.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(burgermenubutton.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_each(each_blocks, detaching);
    			destroy_component(burgermenubutton);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let toggle;
    	currentToggle.subscribe(newValue => $$invalidate(1, toggle = newValue));

    	const link = () => {
    		if (toggle) {
    			$$invalidate(1, toggle = !toggle);
    			currentToggle.update(existing => toggle);
    			document.body.classList.toggle("noscroll");
    		}
    	};

    	const toggleMenu = () => {
    		$$invalidate(1, toggle = !toggle);
    		currentToggle.update(existing => toggle);
    		document.body.classList.toggle("noscroll");
    	};

    	let src = "images/logo-white.svg";
    	let { altLogo = "Logo" } = $$props;

    	let menuItems = [
    		{
    			title: "Спортивный комплекс",
    			url: "#sportsComplex"
    		},
    		{
    			title: "Гостиничный комплекс",
    			url: "#hotelComplex"
    		},
    		{ title: "Услуги", url: "#services" },
    		{ title: "Как добраться", url: "#howReach" },
    		{ title: "Блог", url: "#newsBlog" }
    	];

    	const writable_props = ['altLogo'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('altLogo' in $$props) $$invalidate(0, altLogo = $$props.altLogo);
    	};

    	$$self.$capture_state = () => ({
    		AsideMenu,
    		BurgerMenuButton,
    		currentToggle,
    		fade,
    		toggle,
    		link,
    		toggleMenu,
    		src,
    		altLogo,
    		menuItems
    	});

    	$$self.$inject_state = $$props => {
    		if ('toggle' in $$props) $$invalidate(1, toggle = $$props.toggle);
    		if ('src' in $$props) $$invalidate(4, src = $$props.src);
    		if ('altLogo' in $$props) $$invalidate(0, altLogo = $$props.altLogo);
    		if ('menuItems' in $$props) $$invalidate(5, menuItems = $$props.menuItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [altLogo, toggle, link, toggleMenu, src, menuItems];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { altLogo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get altLogo() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set altLogo(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Main.svelte generated by Svelte v3.43.2 */
    const file$6 = "src\\components\\Main.svelte";

    function create_fragment$7(ctx) {
    	let div2;
    	let header;
    	let t0;
    	let div0;
    	let h2;
    	let t1;
    	let t2;
    	let h1;
    	let t3;
    	let t4;
    	let p;
    	let t6;
    	let div1;
    	let t7;
    	let a;
    	let img;
    	let img_src_value;
    	let t8;
    	let video;
    	let source;
    	let source_src_value;
    	let current;

    	header = new Header({
    			props: { altLogo: /*altLogo*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			t1 = text(/*subtitle*/ ctx[1]);
    			t2 = space();
    			h1 = element("h1");
    			t3 = text(/*title*/ ctx[0]);
    			t4 = space();
    			p = element("p");
    			p.textContent = `${/*descr*/ ctx[5]}`;
    			t6 = space();
    			div1 = element("div");
    			t7 = space();
    			a = element("a");
    			img = element("img");
    			t8 = space();
    			video = element("video");
    			source = element("source");
    			attr_dev(h2, "class", "subtitle svelte-1ms9p8u");
    			add_location(h2, file$6, 16, 4, 512);
    			attr_dev(h1, "class", "title svelte-1ms9p8u");
    			add_location(h1, file$6, 17, 4, 554);
    			attr_dev(p, "class", "svelte-1ms9p8u");
    			add_location(p, file$6, 18, 4, 590);
    			attr_dev(div0, "class", "heading svelte-1ms9p8u");
    			add_location(div0, file$6, 15, 2, 485);
    			attr_dev(div1, "class", "shadow svelte-1ms9p8u");
    			add_location(div1, file$6, 20, 2, 618);
    			attr_dev(img, "class", "down-btn__icon svelte-1ms9p8u");
    			if (!src_url_equal(img.src, img_src_value = "images/icons/collapse.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$6, 23, 4, 694);
    			attr_dev(a, "class", "down-btn svelte-1ms9p8u");
    			attr_dev(a, "href", "#sportsComplex");
    			add_location(a, file$6, 22, 2, 646);
    			if (!src_url_equal(source.src, source_src_value = /*bgVideoUrl*/ ctx[4])) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4; codecs=\"avc1.42E01E, mp4a.40.2\"");
    			add_location(source, file$6, 27, 4, 849);
    			attr_dev(video, "width", "100%");
    			attr_dev(video, "height", "100%");
    			attr_dev(video, "poster", /*poster*/ ctx[3]);
    			video.autoplay = true;
    			video.muted = true;
    			video.loop = true;
    			add_location(video, file$6, 26, 2, 780);
    			attr_dev(div2, "class", "main svelte-1ms9p8u");
    			add_location(div2, file$6, 12, 0, 437);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			mount_component(header, div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t1);
    			append_dev(div0, t2);
    			append_dev(div0, h1);
    			append_dev(h1, t3);
    			append_dev(div0, t4);
    			append_dev(div0, p);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div2, t7);
    			append_dev(div2, a);
    			append_dev(a, img);
    			append_dev(div2, t8);
    			append_dev(div2, video);
    			append_dev(video, source);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*altLogo*/ 4) header_changes.altLogo = /*altLogo*/ ctx[2];
    			header.$set(header_changes);
    			if (!current || dirty & /*subtitle*/ 2) set_data_dev(t1, /*subtitle*/ ctx[1]);
    			if (!current || dirty & /*title*/ 1) set_data_dev(t3, /*title*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	let poster = "images/main-bg.jpg";
    	let bgVideoUrl = "content/Main/bg.mp4";
    	let { title = "Гора Долгая" } = $$props;
    	let { subtitle = "Горнолыжный комплекс" } = $$props;
    	let { altLogo = title + " " + subtitle } = $$props;
    	let descr = "Насладитесь всеми прелестями активного отдыха на природе в сочетании с европейским комфортом и профессиональным обустройством трасс.";
    	const writable_props = ['title', 'subtitle', 'altLogo'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('subtitle' in $$props) $$invalidate(1, subtitle = $$props.subtitle);
    		if ('altLogo' in $$props) $$invalidate(2, altLogo = $$props.altLogo);
    	};

    	$$self.$capture_state = () => ({
    		Header,
    		poster,
    		bgVideoUrl,
    		title,
    		subtitle,
    		altLogo,
    		descr
    	});

    	$$self.$inject_state = $$props => {
    		if ('poster' in $$props) $$invalidate(3, poster = $$props.poster);
    		if ('bgVideoUrl' in $$props) $$invalidate(4, bgVideoUrl = $$props.bgVideoUrl);
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('subtitle' in $$props) $$invalidate(1, subtitle = $$props.subtitle);
    		if ('altLogo' in $$props) $$invalidate(2, altLogo = $$props.altLogo);
    		if ('descr' in $$props) $$invalidate(5, descr = $$props.descr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, subtitle, altLogo, poster, bgVideoUrl, descr];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { title: 0, subtitle: 1, altLogo: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get title() {
    		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subtitle() {
    		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subtitle(value) {
    		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get altLogo() {
    		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set altLogo(value) {
    		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    function commonjsRequire (target) {
    	throw new Error('Could not dynamically require "' + target + '". Please configure the dynamicRequireTargets option of @rollup/plugin-commonjs appropriately for this require call to behave properly.');
    }

    var moment = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
        module.exports = factory() ;
    }(commonjsGlobal, (function () {
        var hookCallback;

        function hooks() {
            return hookCallback.apply(null, arguments);
        }

        // This is done to register the method called with moment()
        // without creating circular dependencies.
        function setHookCallback(callback) {
            hookCallback = callback;
        }

        function isArray(input) {
            return (
                input instanceof Array ||
                Object.prototype.toString.call(input) === '[object Array]'
            );
        }

        function isObject(input) {
            // IE8 will treat undefined and null as object if it wasn't for
            // input != null
            return (
                input != null &&
                Object.prototype.toString.call(input) === '[object Object]'
            );
        }

        function hasOwnProp(a, b) {
            return Object.prototype.hasOwnProperty.call(a, b);
        }

        function isObjectEmpty(obj) {
            if (Object.getOwnPropertyNames) {
                return Object.getOwnPropertyNames(obj).length === 0;
            } else {
                var k;
                for (k in obj) {
                    if (hasOwnProp(obj, k)) {
                        return false;
                    }
                }
                return true;
            }
        }

        function isUndefined(input) {
            return input === void 0;
        }

        function isNumber(input) {
            return (
                typeof input === 'number' ||
                Object.prototype.toString.call(input) === '[object Number]'
            );
        }

        function isDate(input) {
            return (
                input instanceof Date ||
                Object.prototype.toString.call(input) === '[object Date]'
            );
        }

        function map(arr, fn) {
            var res = [],
                i;
            for (i = 0; i < arr.length; ++i) {
                res.push(fn(arr[i], i));
            }
            return res;
        }

        function extend(a, b) {
            for (var i in b) {
                if (hasOwnProp(b, i)) {
                    a[i] = b[i];
                }
            }

            if (hasOwnProp(b, 'toString')) {
                a.toString = b.toString;
            }

            if (hasOwnProp(b, 'valueOf')) {
                a.valueOf = b.valueOf;
            }

            return a;
        }

        function createUTC(input, format, locale, strict) {
            return createLocalOrUTC(input, format, locale, strict, true).utc();
        }

        function defaultParsingFlags() {
            // We need to deep clone this object.
            return {
                empty: false,
                unusedTokens: [],
                unusedInput: [],
                overflow: -2,
                charsLeftOver: 0,
                nullInput: false,
                invalidEra: null,
                invalidMonth: null,
                invalidFormat: false,
                userInvalidated: false,
                iso: false,
                parsedDateParts: [],
                era: null,
                meridiem: null,
                rfc2822: false,
                weekdayMismatch: false,
            };
        }

        function getParsingFlags(m) {
            if (m._pf == null) {
                m._pf = defaultParsingFlags();
            }
            return m._pf;
        }

        var some;
        if (Array.prototype.some) {
            some = Array.prototype.some;
        } else {
            some = function (fun) {
                var t = Object(this),
                    len = t.length >>> 0,
                    i;

                for (i = 0; i < len; i++) {
                    if (i in t && fun.call(this, t[i], i, t)) {
                        return true;
                    }
                }

                return false;
            };
        }

        function isValid(m) {
            if (m._isValid == null) {
                var flags = getParsingFlags(m),
                    parsedParts = some.call(flags.parsedDateParts, function (i) {
                        return i != null;
                    }),
                    isNowValid =
                        !isNaN(m._d.getTime()) &&
                        flags.overflow < 0 &&
                        !flags.empty &&
                        !flags.invalidEra &&
                        !flags.invalidMonth &&
                        !flags.invalidWeekday &&
                        !flags.weekdayMismatch &&
                        !flags.nullInput &&
                        !flags.invalidFormat &&
                        !flags.userInvalidated &&
                        (!flags.meridiem || (flags.meridiem && parsedParts));

                if (m._strict) {
                    isNowValid =
                        isNowValid &&
                        flags.charsLeftOver === 0 &&
                        flags.unusedTokens.length === 0 &&
                        flags.bigHour === undefined;
                }

                if (Object.isFrozen == null || !Object.isFrozen(m)) {
                    m._isValid = isNowValid;
                } else {
                    return isNowValid;
                }
            }
            return m._isValid;
        }

        function createInvalid(flags) {
            var m = createUTC(NaN);
            if (flags != null) {
                extend(getParsingFlags(m), flags);
            } else {
                getParsingFlags(m).userInvalidated = true;
            }

            return m;
        }

        // Plugins that add properties should also add the key here (null value),
        // so we can properly clone ourselves.
        var momentProperties = (hooks.momentProperties = []),
            updateInProgress = false;

        function copyConfig(to, from) {
            var i, prop, val;

            if (!isUndefined(from._isAMomentObject)) {
                to._isAMomentObject = from._isAMomentObject;
            }
            if (!isUndefined(from._i)) {
                to._i = from._i;
            }
            if (!isUndefined(from._f)) {
                to._f = from._f;
            }
            if (!isUndefined(from._l)) {
                to._l = from._l;
            }
            if (!isUndefined(from._strict)) {
                to._strict = from._strict;
            }
            if (!isUndefined(from._tzm)) {
                to._tzm = from._tzm;
            }
            if (!isUndefined(from._isUTC)) {
                to._isUTC = from._isUTC;
            }
            if (!isUndefined(from._offset)) {
                to._offset = from._offset;
            }
            if (!isUndefined(from._pf)) {
                to._pf = getParsingFlags(from);
            }
            if (!isUndefined(from._locale)) {
                to._locale = from._locale;
            }

            if (momentProperties.length > 0) {
                for (i = 0; i < momentProperties.length; i++) {
                    prop = momentProperties[i];
                    val = from[prop];
                    if (!isUndefined(val)) {
                        to[prop] = val;
                    }
                }
            }

            return to;
        }

        // Moment prototype object
        function Moment(config) {
            copyConfig(this, config);
            this._d = new Date(config._d != null ? config._d.getTime() : NaN);
            if (!this.isValid()) {
                this._d = new Date(NaN);
            }
            // Prevent infinite loop in case updateOffset creates new moment
            // objects.
            if (updateInProgress === false) {
                updateInProgress = true;
                hooks.updateOffset(this);
                updateInProgress = false;
            }
        }

        function isMoment(obj) {
            return (
                obj instanceof Moment || (obj != null && obj._isAMomentObject != null)
            );
        }

        function warn(msg) {
            if (
                hooks.suppressDeprecationWarnings === false &&
                typeof console !== 'undefined' &&
                console.warn
            ) {
                console.warn('Deprecation warning: ' + msg);
            }
        }

        function deprecate(msg, fn) {
            var firstTime = true;

            return extend(function () {
                if (hooks.deprecationHandler != null) {
                    hooks.deprecationHandler(null, msg);
                }
                if (firstTime) {
                    var args = [],
                        arg,
                        i,
                        key;
                    for (i = 0; i < arguments.length; i++) {
                        arg = '';
                        if (typeof arguments[i] === 'object') {
                            arg += '\n[' + i + '] ';
                            for (key in arguments[0]) {
                                if (hasOwnProp(arguments[0], key)) {
                                    arg += key + ': ' + arguments[0][key] + ', ';
                                }
                            }
                            arg = arg.slice(0, -2); // Remove trailing comma and space
                        } else {
                            arg = arguments[i];
                        }
                        args.push(arg);
                    }
                    warn(
                        msg +
                            '\nArguments: ' +
                            Array.prototype.slice.call(args).join('') +
                            '\n' +
                            new Error().stack
                    );
                    firstTime = false;
                }
                return fn.apply(this, arguments);
            }, fn);
        }

        var deprecations = {};

        function deprecateSimple(name, msg) {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(name, msg);
            }
            if (!deprecations[name]) {
                warn(msg);
                deprecations[name] = true;
            }
        }

        hooks.suppressDeprecationWarnings = false;
        hooks.deprecationHandler = null;

        function isFunction(input) {
            return (
                (typeof Function !== 'undefined' && input instanceof Function) ||
                Object.prototype.toString.call(input) === '[object Function]'
            );
        }

        function set(config) {
            var prop, i;
            for (i in config) {
                if (hasOwnProp(config, i)) {
                    prop = config[i];
                    if (isFunction(prop)) {
                        this[i] = prop;
                    } else {
                        this['_' + i] = prop;
                    }
                }
            }
            this._config = config;
            // Lenient ordinal parsing accepts just a number in addition to
            // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
            // TODO: Remove "ordinalParse" fallback in next major release.
            this._dayOfMonthOrdinalParseLenient = new RegExp(
                (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                    '|' +
                    /\d{1,2}/.source
            );
        }

        function mergeConfigs(parentConfig, childConfig) {
            var res = extend({}, parentConfig),
                prop;
            for (prop in childConfig) {
                if (hasOwnProp(childConfig, prop)) {
                    if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                        res[prop] = {};
                        extend(res[prop], parentConfig[prop]);
                        extend(res[prop], childConfig[prop]);
                    } else if (childConfig[prop] != null) {
                        res[prop] = childConfig[prop];
                    } else {
                        delete res[prop];
                    }
                }
            }
            for (prop in parentConfig) {
                if (
                    hasOwnProp(parentConfig, prop) &&
                    !hasOwnProp(childConfig, prop) &&
                    isObject(parentConfig[prop])
                ) {
                    // make sure changes to properties don't modify parent config
                    res[prop] = extend({}, res[prop]);
                }
            }
            return res;
        }

        function Locale(config) {
            if (config != null) {
                this.set(config);
            }
        }

        var keys;

        if (Object.keys) {
            keys = Object.keys;
        } else {
            keys = function (obj) {
                var i,
                    res = [];
                for (i in obj) {
                    if (hasOwnProp(obj, i)) {
                        res.push(i);
                    }
                }
                return res;
            };
        }

        var defaultCalendar = {
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            nextWeek: 'dddd [at] LT',
            lastDay: '[Yesterday at] LT',
            lastWeek: '[Last] dddd [at] LT',
            sameElse: 'L',
        };

        function calendar(key, mom, now) {
            var output = this._calendar[key] || this._calendar['sameElse'];
            return isFunction(output) ? output.call(mom, now) : output;
        }

        function zeroFill(number, targetLength, forceSign) {
            var absNumber = '' + Math.abs(number),
                zerosToFill = targetLength - absNumber.length,
                sign = number >= 0;
            return (
                (sign ? (forceSign ? '+' : '') : '-') +
                Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) +
                absNumber
            );
        }

        var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
            localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
            formatFunctions = {},
            formatTokenFunctions = {};

        // token:    'M'
        // padded:   ['MM', 2]
        // ordinal:  'Mo'
        // callback: function () { this.month() + 1 }
        function addFormatToken(token, padded, ordinal, callback) {
            var func = callback;
            if (typeof callback === 'string') {
                func = function () {
                    return this[callback]();
                };
            }
            if (token) {
                formatTokenFunctions[token] = func;
            }
            if (padded) {
                formatTokenFunctions[padded[0]] = function () {
                    return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
                };
            }
            if (ordinal) {
                formatTokenFunctions[ordinal] = function () {
                    return this.localeData().ordinal(
                        func.apply(this, arguments),
                        token
                    );
                };
            }
        }

        function removeFormattingTokens(input) {
            if (input.match(/\[[\s\S]/)) {
                return input.replace(/^\[|\]$/g, '');
            }
            return input.replace(/\\/g, '');
        }

        function makeFormatFunction(format) {
            var array = format.match(formattingTokens),
                i,
                length;

            for (i = 0, length = array.length; i < length; i++) {
                if (formatTokenFunctions[array[i]]) {
                    array[i] = formatTokenFunctions[array[i]];
                } else {
                    array[i] = removeFormattingTokens(array[i]);
                }
            }

            return function (mom) {
                var output = '',
                    i;
                for (i = 0; i < length; i++) {
                    output += isFunction(array[i])
                        ? array[i].call(mom, format)
                        : array[i];
                }
                return output;
            };
        }

        // format date using native date object
        function formatMoment(m, format) {
            if (!m.isValid()) {
                return m.localeData().invalidDate();
            }

            format = expandFormat(format, m.localeData());
            formatFunctions[format] =
                formatFunctions[format] || makeFormatFunction(format);

            return formatFunctions[format](m);
        }

        function expandFormat(format, locale) {
            var i = 5;

            function replaceLongDateFormatTokens(input) {
                return locale.longDateFormat(input) || input;
            }

            localFormattingTokens.lastIndex = 0;
            while (i >= 0 && localFormattingTokens.test(format)) {
                format = format.replace(
                    localFormattingTokens,
                    replaceLongDateFormatTokens
                );
                localFormattingTokens.lastIndex = 0;
                i -= 1;
            }

            return format;
        }

        var defaultLongDateFormat = {
            LTS: 'h:mm:ss A',
            LT: 'h:mm A',
            L: 'MM/DD/YYYY',
            LL: 'MMMM D, YYYY',
            LLL: 'MMMM D, YYYY h:mm A',
            LLLL: 'dddd, MMMM D, YYYY h:mm A',
        };

        function longDateFormat(key) {
            var format = this._longDateFormat[key],
                formatUpper = this._longDateFormat[key.toUpperCase()];

            if (format || !formatUpper) {
                return format;
            }

            this._longDateFormat[key] = formatUpper
                .match(formattingTokens)
                .map(function (tok) {
                    if (
                        tok === 'MMMM' ||
                        tok === 'MM' ||
                        tok === 'DD' ||
                        tok === 'dddd'
                    ) {
                        return tok.slice(1);
                    }
                    return tok;
                })
                .join('');

            return this._longDateFormat[key];
        }

        var defaultInvalidDate = 'Invalid date';

        function invalidDate() {
            return this._invalidDate;
        }

        var defaultOrdinal = '%d',
            defaultDayOfMonthOrdinalParse = /\d{1,2}/;

        function ordinal(number) {
            return this._ordinal.replace('%d', number);
        }

        var defaultRelativeTime = {
            future: 'in %s',
            past: '%s ago',
            s: 'a few seconds',
            ss: '%d seconds',
            m: 'a minute',
            mm: '%d minutes',
            h: 'an hour',
            hh: '%d hours',
            d: 'a day',
            dd: '%d days',
            w: 'a week',
            ww: '%d weeks',
            M: 'a month',
            MM: '%d months',
            y: 'a year',
            yy: '%d years',
        };

        function relativeTime(number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return isFunction(output)
                ? output(number, withoutSuffix, string, isFuture)
                : output.replace(/%d/i, number);
        }

        function pastFuture(diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return isFunction(format) ? format(output) : format.replace(/%s/i, output);
        }

        var aliases = {};

        function addUnitAlias(unit, shorthand) {
            var lowerCase = unit.toLowerCase();
            aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
        }

        function normalizeUnits(units) {
            return typeof units === 'string'
                ? aliases[units] || aliases[units.toLowerCase()]
                : undefined;
        }

        function normalizeObjectUnits(inputObject) {
            var normalizedInput = {},
                normalizedProp,
                prop;

            for (prop in inputObject) {
                if (hasOwnProp(inputObject, prop)) {
                    normalizedProp = normalizeUnits(prop);
                    if (normalizedProp) {
                        normalizedInput[normalizedProp] = inputObject[prop];
                    }
                }
            }

            return normalizedInput;
        }

        var priorities = {};

        function addUnitPriority(unit, priority) {
            priorities[unit] = priority;
        }

        function getPrioritizedUnits(unitsObj) {
            var units = [],
                u;
            for (u in unitsObj) {
                if (hasOwnProp(unitsObj, u)) {
                    units.push({ unit: u, priority: priorities[u] });
                }
            }
            units.sort(function (a, b) {
                return a.priority - b.priority;
            });
            return units;
        }

        function isLeapYear(year) {
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        }

        function absFloor(number) {
            if (number < 0) {
                // -0 -> 0
                return Math.ceil(number) || 0;
            } else {
                return Math.floor(number);
            }
        }

        function toInt(argumentForCoercion) {
            var coercedNumber = +argumentForCoercion,
                value = 0;

            if (coercedNumber !== 0 && isFinite(coercedNumber)) {
                value = absFloor(coercedNumber);
            }

            return value;
        }

        function makeGetSet(unit, keepTime) {
            return function (value) {
                if (value != null) {
                    set$1(this, unit, value);
                    hooks.updateOffset(this, keepTime);
                    return this;
                } else {
                    return get(this, unit);
                }
            };
        }

        function get(mom, unit) {
            return mom.isValid()
                ? mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]()
                : NaN;
        }

        function set$1(mom, unit, value) {
            if (mom.isValid() && !isNaN(value)) {
                if (
                    unit === 'FullYear' &&
                    isLeapYear(mom.year()) &&
                    mom.month() === 1 &&
                    mom.date() === 29
                ) {
                    value = toInt(value);
                    mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](
                        value,
                        mom.month(),
                        daysInMonth(value, mom.month())
                    );
                } else {
                    mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
                }
            }
        }

        // MOMENTS

        function stringGet(units) {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units]();
            }
            return this;
        }

        function stringSet(units, value) {
            if (typeof units === 'object') {
                units = normalizeObjectUnits(units);
                var prioritized = getPrioritizedUnits(units),
                    i;
                for (i = 0; i < prioritized.length; i++) {
                    this[prioritized[i].unit](units[prioritized[i].unit]);
                }
            } else {
                units = normalizeUnits(units);
                if (isFunction(this[units])) {
                    return this[units](value);
                }
            }
            return this;
        }

        var match1 = /\d/, //       0 - 9
            match2 = /\d\d/, //      00 - 99
            match3 = /\d{3}/, //     000 - 999
            match4 = /\d{4}/, //    0000 - 9999
            match6 = /[+-]?\d{6}/, // -999999 - 999999
            match1to2 = /\d\d?/, //       0 - 99
            match3to4 = /\d\d\d\d?/, //     999 - 9999
            match5to6 = /\d\d\d\d\d\d?/, //   99999 - 999999
            match1to3 = /\d{1,3}/, //       0 - 999
            match1to4 = /\d{1,4}/, //       0 - 9999
            match1to6 = /[+-]?\d{1,6}/, // -999999 - 999999
            matchUnsigned = /\d+/, //       0 - inf
            matchSigned = /[+-]?\d+/, //    -inf - inf
            matchOffset = /Z|[+-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
            matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi, // +00 -00 +00:00 -00:00 +0000 -0000 or Z
            matchTimestamp = /[+-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
            // any word (or two) characters or numbers including two/three word month in arabic.
            // includes scottish gaelic two word and hyphenated months
            matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
            regexes;

        regexes = {};

        function addRegexToken(token, regex, strictRegex) {
            regexes[token] = isFunction(regex)
                ? regex
                : function (isStrict, localeData) {
                      return isStrict && strictRegex ? strictRegex : regex;
                  };
        }

        function getParseRegexForToken(token, config) {
            if (!hasOwnProp(regexes, token)) {
                return new RegExp(unescapeFormat(token));
            }

            return regexes[token](config._strict, config._locale);
        }

        // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
        function unescapeFormat(s) {
            return regexEscape(
                s
                    .replace('\\', '')
                    .replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (
                        matched,
                        p1,
                        p2,
                        p3,
                        p4
                    ) {
                        return p1 || p2 || p3 || p4;
                    })
            );
        }

        function regexEscape(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }

        var tokens = {};

        function addParseToken(token, callback) {
            var i,
                func = callback;
            if (typeof token === 'string') {
                token = [token];
            }
            if (isNumber(callback)) {
                func = function (input, array) {
                    array[callback] = toInt(input);
                };
            }
            for (i = 0; i < token.length; i++) {
                tokens[token[i]] = func;
            }
        }

        function addWeekParseToken(token, callback) {
            addParseToken(token, function (input, array, config, token) {
                config._w = config._w || {};
                callback(input, config._w, config, token);
            });
        }

        function addTimeToArrayFromToken(token, input, config) {
            if (input != null && hasOwnProp(tokens, token)) {
                tokens[token](input, config._a, config, token);
            }
        }

        var YEAR = 0,
            MONTH = 1,
            DATE = 2,
            HOUR = 3,
            MINUTE = 4,
            SECOND = 5,
            MILLISECOND = 6,
            WEEK = 7,
            WEEKDAY = 8;

        function mod(n, x) {
            return ((n % x) + x) % x;
        }

        var indexOf;

        if (Array.prototype.indexOf) {
            indexOf = Array.prototype.indexOf;
        } else {
            indexOf = function (o) {
                // I know
                var i;
                for (i = 0; i < this.length; ++i) {
                    if (this[i] === o) {
                        return i;
                    }
                }
                return -1;
            };
        }

        function daysInMonth(year, month) {
            if (isNaN(year) || isNaN(month)) {
                return NaN;
            }
            var modMonth = mod(month, 12);
            year += (month - modMonth) / 12;
            return modMonth === 1
                ? isLeapYear(year)
                    ? 29
                    : 28
                : 31 - ((modMonth % 7) % 2);
        }

        // FORMATTING

        addFormatToken('M', ['MM', 2], 'Mo', function () {
            return this.month() + 1;
        });

        addFormatToken('MMM', 0, 0, function (format) {
            return this.localeData().monthsShort(this, format);
        });

        addFormatToken('MMMM', 0, 0, function (format) {
            return this.localeData().months(this, format);
        });

        // ALIASES

        addUnitAlias('month', 'M');

        // PRIORITY

        addUnitPriority('month', 8);

        // PARSING

        addRegexToken('M', match1to2);
        addRegexToken('MM', match1to2, match2);
        addRegexToken('MMM', function (isStrict, locale) {
            return locale.monthsShortRegex(isStrict);
        });
        addRegexToken('MMMM', function (isStrict, locale) {
            return locale.monthsRegex(isStrict);
        });

        addParseToken(['M', 'MM'], function (input, array) {
            array[MONTH] = toInt(input) - 1;
        });

        addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
            var month = config._locale.monthsParse(input, token, config._strict);
            // if we didn't find a month name, mark the date as invalid.
            if (month != null) {
                array[MONTH] = month;
            } else {
                getParsingFlags(config).invalidMonth = input;
            }
        });

        // LOCALES

        var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
                '_'
            ),
            defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split(
                '_'
            ),
            MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
            defaultMonthsShortRegex = matchWord,
            defaultMonthsRegex = matchWord;

        function localeMonths(m, format) {
            if (!m) {
                return isArray(this._months)
                    ? this._months
                    : this._months['standalone'];
            }
            return isArray(this._months)
                ? this._months[m.month()]
                : this._months[
                      (this._months.isFormat || MONTHS_IN_FORMAT).test(format)
                          ? 'format'
                          : 'standalone'
                  ][m.month()];
        }

        function localeMonthsShort(m, format) {
            if (!m) {
                return isArray(this._monthsShort)
                    ? this._monthsShort
                    : this._monthsShort['standalone'];
            }
            return isArray(this._monthsShort)
                ? this._monthsShort[m.month()]
                : this._monthsShort[
                      MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'
                  ][m.month()];
        }

        function handleStrictParse(monthName, format, strict) {
            var i,
                ii,
                mom,
                llc = monthName.toLocaleLowerCase();
            if (!this._monthsParse) {
                // this is not used
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
                for (i = 0; i < 12; ++i) {
                    mom = createUTC([2000, i]);
                    this._shortMonthsParse[i] = this.monthsShort(
                        mom,
                        ''
                    ).toLocaleLowerCase();
                    this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
                }
            }

            if (strict) {
                if (format === 'MMM') {
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._longMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                }
            } else {
                if (format === 'MMM') {
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._longMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._longMonthsParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                }
            }
        }

        function localeMonthsParse(monthName, format, strict) {
            var i, mom, regex;

            if (this._monthsParseExact) {
                return handleStrictParse.call(this, monthName, format, strict);
            }

            if (!this._monthsParse) {
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
            }

            // TODO: add sorting
            // Sorting makes sure if one month (or abbr) is a prefix of another
            // see sorting in computeMonthsParse
            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, i]);
                if (strict && !this._longMonthsParse[i]) {
                    this._longMonthsParse[i] = new RegExp(
                        '^' + this.months(mom, '').replace('.', '') + '$',
                        'i'
                    );
                    this._shortMonthsParse[i] = new RegExp(
                        '^' + this.monthsShort(mom, '').replace('.', '') + '$',
                        'i'
                    );
                }
                if (!strict && !this._monthsParse[i]) {
                    regex =
                        '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (
                    strict &&
                    format === 'MMMM' &&
                    this._longMonthsParse[i].test(monthName)
                ) {
                    return i;
                } else if (
                    strict &&
                    format === 'MMM' &&
                    this._shortMonthsParse[i].test(monthName)
                ) {
                    return i;
                } else if (!strict && this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        }

        // MOMENTS

        function setMonth(mom, value) {
            var dayOfMonth;

            if (!mom.isValid()) {
                // No op
                return mom;
            }

            if (typeof value === 'string') {
                if (/^\d+$/.test(value)) {
                    value = toInt(value);
                } else {
                    value = mom.localeData().monthsParse(value);
                    // TODO: Another silent failure?
                    if (!isNumber(value)) {
                        return mom;
                    }
                }
            }

            dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
            return mom;
        }

        function getSetMonth(value) {
            if (value != null) {
                setMonth(this, value);
                hooks.updateOffset(this, true);
                return this;
            } else {
                return get(this, 'Month');
            }
        }

        function getDaysInMonth() {
            return daysInMonth(this.year(), this.month());
        }

        function monthsShortRegex(isStrict) {
            if (this._monthsParseExact) {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    computeMonthsParse.call(this);
                }
                if (isStrict) {
                    return this._monthsShortStrictRegex;
                } else {
                    return this._monthsShortRegex;
                }
            } else {
                if (!hasOwnProp(this, '_monthsShortRegex')) {
                    this._monthsShortRegex = defaultMonthsShortRegex;
                }
                return this._monthsShortStrictRegex && isStrict
                    ? this._monthsShortStrictRegex
                    : this._monthsShortRegex;
            }
        }

        function monthsRegex(isStrict) {
            if (this._monthsParseExact) {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    computeMonthsParse.call(this);
                }
                if (isStrict) {
                    return this._monthsStrictRegex;
                } else {
                    return this._monthsRegex;
                }
            } else {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    this._monthsRegex = defaultMonthsRegex;
                }
                return this._monthsStrictRegex && isStrict
                    ? this._monthsStrictRegex
                    : this._monthsRegex;
            }
        }

        function computeMonthsParse() {
            function cmpLenRev(a, b) {
                return b.length - a.length;
            }

            var shortPieces = [],
                longPieces = [],
                mixedPieces = [],
                i,
                mom;
            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, i]);
                shortPieces.push(this.monthsShort(mom, ''));
                longPieces.push(this.months(mom, ''));
                mixedPieces.push(this.months(mom, ''));
                mixedPieces.push(this.monthsShort(mom, ''));
            }
            // Sorting makes sure if one month (or abbr) is a prefix of another it
            // will match the longer piece.
            shortPieces.sort(cmpLenRev);
            longPieces.sort(cmpLenRev);
            mixedPieces.sort(cmpLenRev);
            for (i = 0; i < 12; i++) {
                shortPieces[i] = regexEscape(shortPieces[i]);
                longPieces[i] = regexEscape(longPieces[i]);
            }
            for (i = 0; i < 24; i++) {
                mixedPieces[i] = regexEscape(mixedPieces[i]);
            }

            this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
            this._monthsShortRegex = this._monthsRegex;
            this._monthsStrictRegex = new RegExp(
                '^(' + longPieces.join('|') + ')',
                'i'
            );
            this._monthsShortStrictRegex = new RegExp(
                '^(' + shortPieces.join('|') + ')',
                'i'
            );
        }

        // FORMATTING

        addFormatToken('Y', 0, 0, function () {
            var y = this.year();
            return y <= 9999 ? zeroFill(y, 4) : '+' + y;
        });

        addFormatToken(0, ['YY', 2], 0, function () {
            return this.year() % 100;
        });

        addFormatToken(0, ['YYYY', 4], 0, 'year');
        addFormatToken(0, ['YYYYY', 5], 0, 'year');
        addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

        // ALIASES

        addUnitAlias('year', 'y');

        // PRIORITIES

        addUnitPriority('year', 1);

        // PARSING

        addRegexToken('Y', matchSigned);
        addRegexToken('YY', match1to2, match2);
        addRegexToken('YYYY', match1to4, match4);
        addRegexToken('YYYYY', match1to6, match6);
        addRegexToken('YYYYYY', match1to6, match6);

        addParseToken(['YYYYY', 'YYYYYY'], YEAR);
        addParseToken('YYYY', function (input, array) {
            array[YEAR] =
                input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
        });
        addParseToken('YY', function (input, array) {
            array[YEAR] = hooks.parseTwoDigitYear(input);
        });
        addParseToken('Y', function (input, array) {
            array[YEAR] = parseInt(input, 10);
        });

        // HELPERS

        function daysInYear(year) {
            return isLeapYear(year) ? 366 : 365;
        }

        // HOOKS

        hooks.parseTwoDigitYear = function (input) {
            return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
        };

        // MOMENTS

        var getSetYear = makeGetSet('FullYear', true);

        function getIsLeapYear() {
            return isLeapYear(this.year());
        }

        function createDate(y, m, d, h, M, s, ms) {
            // can't just apply() to create a date:
            // https://stackoverflow.com/q/181348
            var date;
            // the date constructor remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0) {
                // preserve leap years using a full 400 year cycle, then reset
                date = new Date(y + 400, m, d, h, M, s, ms);
                if (isFinite(date.getFullYear())) {
                    date.setFullYear(y);
                }
            } else {
                date = new Date(y, m, d, h, M, s, ms);
            }

            return date;
        }

        function createUTCDate(y) {
            var date, args;
            // the Date.UTC function remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0) {
                args = Array.prototype.slice.call(arguments);
                // preserve leap years using a full 400 year cycle, then reset
                args[0] = y + 400;
                date = new Date(Date.UTC.apply(null, args));
                if (isFinite(date.getUTCFullYear())) {
                    date.setUTCFullYear(y);
                }
            } else {
                date = new Date(Date.UTC.apply(null, arguments));
            }

            return date;
        }

        // start-of-first-week - start-of-year
        function firstWeekOffset(year, dow, doy) {
            var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
                fwd = 7 + dow - doy,
                // first-week day local weekday -- which local weekday is fwd
                fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

            return -fwdlw + fwd - 1;
        }

        // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
        function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
            var localWeekday = (7 + weekday - dow) % 7,
                weekOffset = firstWeekOffset(year, dow, doy),
                dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
                resYear,
                resDayOfYear;

            if (dayOfYear <= 0) {
                resYear = year - 1;
                resDayOfYear = daysInYear(resYear) + dayOfYear;
            } else if (dayOfYear > daysInYear(year)) {
                resYear = year + 1;
                resDayOfYear = dayOfYear - daysInYear(year);
            } else {
                resYear = year;
                resDayOfYear = dayOfYear;
            }

            return {
                year: resYear,
                dayOfYear: resDayOfYear,
            };
        }

        function weekOfYear(mom, dow, doy) {
            var weekOffset = firstWeekOffset(mom.year(), dow, doy),
                week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
                resWeek,
                resYear;

            if (week < 1) {
                resYear = mom.year() - 1;
                resWeek = week + weeksInYear(resYear, dow, doy);
            } else if (week > weeksInYear(mom.year(), dow, doy)) {
                resWeek = week - weeksInYear(mom.year(), dow, doy);
                resYear = mom.year() + 1;
            } else {
                resYear = mom.year();
                resWeek = week;
            }

            return {
                week: resWeek,
                year: resYear,
            };
        }

        function weeksInYear(year, dow, doy) {
            var weekOffset = firstWeekOffset(year, dow, doy),
                weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
            return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
        }

        // FORMATTING

        addFormatToken('w', ['ww', 2], 'wo', 'week');
        addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

        // ALIASES

        addUnitAlias('week', 'w');
        addUnitAlias('isoWeek', 'W');

        // PRIORITIES

        addUnitPriority('week', 5);
        addUnitPriority('isoWeek', 5);

        // PARSING

        addRegexToken('w', match1to2);
        addRegexToken('ww', match1to2, match2);
        addRegexToken('W', match1to2);
        addRegexToken('WW', match1to2, match2);

        addWeekParseToken(['w', 'ww', 'W', 'WW'], function (
            input,
            week,
            config,
            token
        ) {
            week[token.substr(0, 1)] = toInt(input);
        });

        // HELPERS

        // LOCALES

        function localeWeek(mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        }

        var defaultLocaleWeek = {
            dow: 0, // Sunday is the first day of the week.
            doy: 6, // The week that contains Jan 6th is the first week of the year.
        };

        function localeFirstDayOfWeek() {
            return this._week.dow;
        }

        function localeFirstDayOfYear() {
            return this._week.doy;
        }

        // MOMENTS

        function getSetWeek(input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        }

        function getSetISOWeek(input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        }

        // FORMATTING

        addFormatToken('d', 0, 'do', 'day');

        addFormatToken('dd', 0, 0, function (format) {
            return this.localeData().weekdaysMin(this, format);
        });

        addFormatToken('ddd', 0, 0, function (format) {
            return this.localeData().weekdaysShort(this, format);
        });

        addFormatToken('dddd', 0, 0, function (format) {
            return this.localeData().weekdays(this, format);
        });

        addFormatToken('e', 0, 0, 'weekday');
        addFormatToken('E', 0, 0, 'isoWeekday');

        // ALIASES

        addUnitAlias('day', 'd');
        addUnitAlias('weekday', 'e');
        addUnitAlias('isoWeekday', 'E');

        // PRIORITY
        addUnitPriority('day', 11);
        addUnitPriority('weekday', 11);
        addUnitPriority('isoWeekday', 11);

        // PARSING

        addRegexToken('d', match1to2);
        addRegexToken('e', match1to2);
        addRegexToken('E', match1to2);
        addRegexToken('dd', function (isStrict, locale) {
            return locale.weekdaysMinRegex(isStrict);
        });
        addRegexToken('ddd', function (isStrict, locale) {
            return locale.weekdaysShortRegex(isStrict);
        });
        addRegexToken('dddd', function (isStrict, locale) {
            return locale.weekdaysRegex(isStrict);
        });

        addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
            var weekday = config._locale.weekdaysParse(input, token, config._strict);
            // if we didn't get a weekday name, mark the date as invalid
            if (weekday != null) {
                week.d = weekday;
            } else {
                getParsingFlags(config).invalidWeekday = input;
            }
        });

        addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
            week[token] = toInt(input);
        });

        // HELPERS

        function parseWeekday(input, locale) {
            if (typeof input !== 'string') {
                return input;
            }

            if (!isNaN(input)) {
                return parseInt(input, 10);
            }

            input = locale.weekdaysParse(input);
            if (typeof input === 'number') {
                return input;
            }

            return null;
        }

        function parseIsoWeekday(input, locale) {
            if (typeof input === 'string') {
                return locale.weekdaysParse(input) % 7 || 7;
            }
            return isNaN(input) ? null : input;
        }

        // LOCALES
        function shiftWeekdays(ws, n) {
            return ws.slice(n, 7).concat(ws.slice(0, n));
        }

        var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
                '_'
            ),
            defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            defaultWeekdaysRegex = matchWord,
            defaultWeekdaysShortRegex = matchWord,
            defaultWeekdaysMinRegex = matchWord;

        function localeWeekdays(m, format) {
            var weekdays = isArray(this._weekdays)
                ? this._weekdays
                : this._weekdays[
                      m && m !== true && this._weekdays.isFormat.test(format)
                          ? 'format'
                          : 'standalone'
                  ];
            return m === true
                ? shiftWeekdays(weekdays, this._week.dow)
                : m
                ? weekdays[m.day()]
                : weekdays;
        }

        function localeWeekdaysShort(m) {
            return m === true
                ? shiftWeekdays(this._weekdaysShort, this._week.dow)
                : m
                ? this._weekdaysShort[m.day()]
                : this._weekdaysShort;
        }

        function localeWeekdaysMin(m) {
            return m === true
                ? shiftWeekdays(this._weekdaysMin, this._week.dow)
                : m
                ? this._weekdaysMin[m.day()]
                : this._weekdaysMin;
        }

        function handleStrictParse$1(weekdayName, format, strict) {
            var i,
                ii,
                mom,
                llc = weekdayName.toLocaleLowerCase();
            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
                this._shortWeekdaysParse = [];
                this._minWeekdaysParse = [];

                for (i = 0; i < 7; ++i) {
                    mom = createUTC([2000, 1]).day(i);
                    this._minWeekdaysParse[i] = this.weekdaysMin(
                        mom,
                        ''
                    ).toLocaleLowerCase();
                    this._shortWeekdaysParse[i] = this.weekdaysShort(
                        mom,
                        ''
                    ).toLocaleLowerCase();
                    this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
                }
            }

            if (strict) {
                if (format === 'dddd') {
                    ii = indexOf.call(this._weekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else if (format === 'ddd') {
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                }
            } else {
                if (format === 'dddd') {
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else if (format === 'ddd') {
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                }
            }
        }

        function localeWeekdaysParse(weekdayName, format, strict) {
            var i, mom, regex;

            if (this._weekdaysParseExact) {
                return handleStrictParse$1.call(this, weekdayName, format, strict);
            }

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
                this._minWeekdaysParse = [];
                this._shortWeekdaysParse = [];
                this._fullWeekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already

                mom = createUTC([2000, 1]).day(i);
                if (strict && !this._fullWeekdaysParse[i]) {
                    this._fullWeekdaysParse[i] = new RegExp(
                        '^' + this.weekdays(mom, '').replace('.', '\\.?') + '$',
                        'i'
                    );
                    this._shortWeekdaysParse[i] = new RegExp(
                        '^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$',
                        'i'
                    );
                    this._minWeekdaysParse[i] = new RegExp(
                        '^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$',
                        'i'
                    );
                }
                if (!this._weekdaysParse[i]) {
                    regex =
                        '^' +
                        this.weekdays(mom, '') +
                        '|^' +
                        this.weekdaysShort(mom, '') +
                        '|^' +
                        this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (
                    strict &&
                    format === 'dddd' &&
                    this._fullWeekdaysParse[i].test(weekdayName)
                ) {
                    return i;
                } else if (
                    strict &&
                    format === 'ddd' &&
                    this._shortWeekdaysParse[i].test(weekdayName)
                ) {
                    return i;
                } else if (
                    strict &&
                    format === 'dd' &&
                    this._minWeekdaysParse[i].test(weekdayName)
                ) {
                    return i;
                } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        }

        // MOMENTS

        function getSetDayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        }

        function getSetLocaleDayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        }

        function getSetISODayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }

            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.

            if (input != null) {
                var weekday = parseIsoWeekday(input, this.localeData());
                return this.day(this.day() % 7 ? weekday : weekday - 7);
            } else {
                return this.day() || 7;
            }
        }

        function weekdaysRegex(isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysStrictRegex;
                } else {
                    return this._weekdaysRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    this._weekdaysRegex = defaultWeekdaysRegex;
                }
                return this._weekdaysStrictRegex && isStrict
                    ? this._weekdaysStrictRegex
                    : this._weekdaysRegex;
            }
        }

        function weekdaysShortRegex(isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysShortStrictRegex;
                } else {
                    return this._weekdaysShortRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                    this._weekdaysShortRegex = defaultWeekdaysShortRegex;
                }
                return this._weekdaysShortStrictRegex && isStrict
                    ? this._weekdaysShortStrictRegex
                    : this._weekdaysShortRegex;
            }
        }

        function weekdaysMinRegex(isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysMinStrictRegex;
                } else {
                    return this._weekdaysMinRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                    this._weekdaysMinRegex = defaultWeekdaysMinRegex;
                }
                return this._weekdaysMinStrictRegex && isStrict
                    ? this._weekdaysMinStrictRegex
                    : this._weekdaysMinRegex;
            }
        }

        function computeWeekdaysParse() {
            function cmpLenRev(a, b) {
                return b.length - a.length;
            }

            var minPieces = [],
                shortPieces = [],
                longPieces = [],
                mixedPieces = [],
                i,
                mom,
                minp,
                shortp,
                longp;
            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, 1]).day(i);
                minp = regexEscape(this.weekdaysMin(mom, ''));
                shortp = regexEscape(this.weekdaysShort(mom, ''));
                longp = regexEscape(this.weekdays(mom, ''));
                minPieces.push(minp);
                shortPieces.push(shortp);
                longPieces.push(longp);
                mixedPieces.push(minp);
                mixedPieces.push(shortp);
                mixedPieces.push(longp);
            }
            // Sorting makes sure if one weekday (or abbr) is a prefix of another it
            // will match the longer piece.
            minPieces.sort(cmpLenRev);
            shortPieces.sort(cmpLenRev);
            longPieces.sort(cmpLenRev);
            mixedPieces.sort(cmpLenRev);

            this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
            this._weekdaysShortRegex = this._weekdaysRegex;
            this._weekdaysMinRegex = this._weekdaysRegex;

            this._weekdaysStrictRegex = new RegExp(
                '^(' + longPieces.join('|') + ')',
                'i'
            );
            this._weekdaysShortStrictRegex = new RegExp(
                '^(' + shortPieces.join('|') + ')',
                'i'
            );
            this._weekdaysMinStrictRegex = new RegExp(
                '^(' + minPieces.join('|') + ')',
                'i'
            );
        }

        // FORMATTING

        function hFormat() {
            return this.hours() % 12 || 12;
        }

        function kFormat() {
            return this.hours() || 24;
        }

        addFormatToken('H', ['HH', 2], 0, 'hour');
        addFormatToken('h', ['hh', 2], 0, hFormat);
        addFormatToken('k', ['kk', 2], 0, kFormat);

        addFormatToken('hmm', 0, 0, function () {
            return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
        });

        addFormatToken('hmmss', 0, 0, function () {
            return (
                '' +
                hFormat.apply(this) +
                zeroFill(this.minutes(), 2) +
                zeroFill(this.seconds(), 2)
            );
        });

        addFormatToken('Hmm', 0, 0, function () {
            return '' + this.hours() + zeroFill(this.minutes(), 2);
        });

        addFormatToken('Hmmss', 0, 0, function () {
            return (
                '' +
                this.hours() +
                zeroFill(this.minutes(), 2) +
                zeroFill(this.seconds(), 2)
            );
        });

        function meridiem(token, lowercase) {
            addFormatToken(token, 0, 0, function () {
                return this.localeData().meridiem(
                    this.hours(),
                    this.minutes(),
                    lowercase
                );
            });
        }

        meridiem('a', true);
        meridiem('A', false);

        // ALIASES

        addUnitAlias('hour', 'h');

        // PRIORITY
        addUnitPriority('hour', 13);

        // PARSING

        function matchMeridiem(isStrict, locale) {
            return locale._meridiemParse;
        }

        addRegexToken('a', matchMeridiem);
        addRegexToken('A', matchMeridiem);
        addRegexToken('H', match1to2);
        addRegexToken('h', match1to2);
        addRegexToken('k', match1to2);
        addRegexToken('HH', match1to2, match2);
        addRegexToken('hh', match1to2, match2);
        addRegexToken('kk', match1to2, match2);

        addRegexToken('hmm', match3to4);
        addRegexToken('hmmss', match5to6);
        addRegexToken('Hmm', match3to4);
        addRegexToken('Hmmss', match5to6);

        addParseToken(['H', 'HH'], HOUR);
        addParseToken(['k', 'kk'], function (input, array, config) {
            var kInput = toInt(input);
            array[HOUR] = kInput === 24 ? 0 : kInput;
        });
        addParseToken(['a', 'A'], function (input, array, config) {
            config._isPm = config._locale.isPM(input);
            config._meridiem = input;
        });
        addParseToken(['h', 'hh'], function (input, array, config) {
            array[HOUR] = toInt(input);
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('hmm', function (input, array, config) {
            var pos = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos));
            array[MINUTE] = toInt(input.substr(pos));
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('hmmss', function (input, array, config) {
            var pos1 = input.length - 4,
                pos2 = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos1));
            array[MINUTE] = toInt(input.substr(pos1, 2));
            array[SECOND] = toInt(input.substr(pos2));
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('Hmm', function (input, array, config) {
            var pos = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos));
            array[MINUTE] = toInt(input.substr(pos));
        });
        addParseToken('Hmmss', function (input, array, config) {
            var pos1 = input.length - 4,
                pos2 = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos1));
            array[MINUTE] = toInt(input.substr(pos1, 2));
            array[SECOND] = toInt(input.substr(pos2));
        });

        // LOCALES

        function localeIsPM(input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return (input + '').toLowerCase().charAt(0) === 'p';
        }

        var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i,
            // Setting the hour should keep the time, because the user explicitly
            // specified which hour they want. So trying to maintain the same hour (in
            // a new timezone) makes sense. Adding/subtracting hours does not follow
            // this rule.
            getSetHour = makeGetSet('Hours', true);

        function localeMeridiem(hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        }

        var baseConfig = {
            calendar: defaultCalendar,
            longDateFormat: defaultLongDateFormat,
            invalidDate: defaultInvalidDate,
            ordinal: defaultOrdinal,
            dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
            relativeTime: defaultRelativeTime,

            months: defaultLocaleMonths,
            monthsShort: defaultLocaleMonthsShort,

            week: defaultLocaleWeek,

            weekdays: defaultLocaleWeekdays,
            weekdaysMin: defaultLocaleWeekdaysMin,
            weekdaysShort: defaultLocaleWeekdaysShort,

            meridiemParse: defaultLocaleMeridiemParse,
        };

        // internal storage for locale config files
        var locales = {},
            localeFamilies = {},
            globalLocale;

        function commonPrefix(arr1, arr2) {
            var i,
                minl = Math.min(arr1.length, arr2.length);
            for (i = 0; i < minl; i += 1) {
                if (arr1[i] !== arr2[i]) {
                    return i;
                }
            }
            return minl;
        }

        function normalizeLocale(key) {
            return key ? key.toLowerCase().replace('_', '-') : key;
        }

        // pick the locale from the array
        // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
        // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
        function chooseLocale(names) {
            var i = 0,
                j,
                next,
                locale,
                split;

            while (i < names.length) {
                split = normalizeLocale(names[i]).split('-');
                j = split.length;
                next = normalizeLocale(names[i + 1]);
                next = next ? next.split('-') : null;
                while (j > 0) {
                    locale = loadLocale(split.slice(0, j).join('-'));
                    if (locale) {
                        return locale;
                    }
                    if (
                        next &&
                        next.length >= j &&
                        commonPrefix(split, next) >= j - 1
                    ) {
                        //the next array item is better than a shallower substring of this one
                        break;
                    }
                    j--;
                }
                i++;
            }
            return globalLocale;
        }

        function loadLocale(name) {
            var oldLocale = null,
                aliasedRequire;
            // TODO: Find a better way to register and load all the locales in Node
            if (
                locales[name] === undefined &&
                'object' !== 'undefined' &&
                module &&
                module.exports
            ) {
                try {
                    oldLocale = globalLocale._abbr;
                    aliasedRequire = commonjsRequire;
                    aliasedRequire('./locale/' + name);
                    getSetGlobalLocale(oldLocale);
                } catch (e) {
                    // mark as not found to avoid repeating expensive file require call causing high CPU
                    // when trying to find en-US, en_US, en-us for every format call
                    locales[name] = null; // null means not found
                }
            }
            return locales[name];
        }

        // This function will load locale and then set the global locale.  If
        // no arguments are passed in, it will simply return the current global
        // locale key.
        function getSetGlobalLocale(key, values) {
            var data;
            if (key) {
                if (isUndefined(values)) {
                    data = getLocale(key);
                } else {
                    data = defineLocale(key, values);
                }

                if (data) {
                    // moment.duration._locale = moment._locale = data;
                    globalLocale = data;
                } else {
                    if (typeof console !== 'undefined' && console.warn) {
                        //warn user if arguments are passed but the locale could not be set
                        console.warn(
                            'Locale ' + key + ' not found. Did you forget to load it?'
                        );
                    }
                }
            }

            return globalLocale._abbr;
        }

        function defineLocale(name, config) {
            if (config !== null) {
                var locale,
                    parentConfig = baseConfig;
                config.abbr = name;
                if (locales[name] != null) {
                    deprecateSimple(
                        'defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                            'an existing locale. moment.defineLocale(localeName, ' +
                            'config) should only be used for creating a new locale ' +
                            'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.'
                    );
                    parentConfig = locales[name]._config;
                } else if (config.parentLocale != null) {
                    if (locales[config.parentLocale] != null) {
                        parentConfig = locales[config.parentLocale]._config;
                    } else {
                        locale = loadLocale(config.parentLocale);
                        if (locale != null) {
                            parentConfig = locale._config;
                        } else {
                            if (!localeFamilies[config.parentLocale]) {
                                localeFamilies[config.parentLocale] = [];
                            }
                            localeFamilies[config.parentLocale].push({
                                name: name,
                                config: config,
                            });
                            return null;
                        }
                    }
                }
                locales[name] = new Locale(mergeConfigs(parentConfig, config));

                if (localeFamilies[name]) {
                    localeFamilies[name].forEach(function (x) {
                        defineLocale(x.name, x.config);
                    });
                }

                // backwards compat for now: also set the locale
                // make sure we set the locale AFTER all child locales have been
                // created, so we won't end up with the child locale set.
                getSetGlobalLocale(name);

                return locales[name];
            } else {
                // useful for testing
                delete locales[name];
                return null;
            }
        }

        function updateLocale(name, config) {
            if (config != null) {
                var locale,
                    tmpLocale,
                    parentConfig = baseConfig;

                if (locales[name] != null && locales[name].parentLocale != null) {
                    // Update existing child locale in-place to avoid memory-leaks
                    locales[name].set(mergeConfigs(locales[name]._config, config));
                } else {
                    // MERGE
                    tmpLocale = loadLocale(name);
                    if (tmpLocale != null) {
                        parentConfig = tmpLocale._config;
                    }
                    config = mergeConfigs(parentConfig, config);
                    if (tmpLocale == null) {
                        // updateLocale is called for creating a new locale
                        // Set abbr so it will have a name (getters return
                        // undefined otherwise).
                        config.abbr = name;
                    }
                    locale = new Locale(config);
                    locale.parentLocale = locales[name];
                    locales[name] = locale;
                }

                // backwards compat for now: also set the locale
                getSetGlobalLocale(name);
            } else {
                // pass null for config to unupdate, useful for tests
                if (locales[name] != null) {
                    if (locales[name].parentLocale != null) {
                        locales[name] = locales[name].parentLocale;
                        if (name === getSetGlobalLocale()) {
                            getSetGlobalLocale(name);
                        }
                    } else if (locales[name] != null) {
                        delete locales[name];
                    }
                }
            }
            return locales[name];
        }

        // returns locale data
        function getLocale(key) {
            var locale;

            if (key && key._locale && key._locale._abbr) {
                key = key._locale._abbr;
            }

            if (!key) {
                return globalLocale;
            }

            if (!isArray(key)) {
                //short-circuit everything else
                locale = loadLocale(key);
                if (locale) {
                    return locale;
                }
                key = [key];
            }

            return chooseLocale(key);
        }

        function listLocales() {
            return keys(locales);
        }

        function checkOverflow(m) {
            var overflow,
                a = m._a;

            if (a && getParsingFlags(m).overflow === -2) {
                overflow =
                    a[MONTH] < 0 || a[MONTH] > 11
                        ? MONTH
                        : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH])
                        ? DATE
                        : a[HOUR] < 0 ||
                          a[HOUR] > 24 ||
                          (a[HOUR] === 24 &&
                              (a[MINUTE] !== 0 ||
                                  a[SECOND] !== 0 ||
                                  a[MILLISECOND] !== 0))
                        ? HOUR
                        : a[MINUTE] < 0 || a[MINUTE] > 59
                        ? MINUTE
                        : a[SECOND] < 0 || a[SECOND] > 59
                        ? SECOND
                        : a[MILLISECOND] < 0 || a[MILLISECOND] > 999
                        ? MILLISECOND
                        : -1;

                if (
                    getParsingFlags(m)._overflowDayOfYear &&
                    (overflow < YEAR || overflow > DATE)
                ) {
                    overflow = DATE;
                }
                if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                    overflow = WEEK;
                }
                if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                    overflow = WEEKDAY;
                }

                getParsingFlags(m).overflow = overflow;
            }

            return m;
        }

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
            basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
            tzRegex = /Z|[+-]\d\d(?::?\d\d)?/,
            isoDates = [
                ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
                ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
                ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
                ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
                ['YYYY-DDD', /\d{4}-\d{3}/],
                ['YYYY-MM', /\d{4}-\d\d/, false],
                ['YYYYYYMMDD', /[+-]\d{10}/],
                ['YYYYMMDD', /\d{8}/],
                ['GGGG[W]WWE', /\d{4}W\d{3}/],
                ['GGGG[W]WW', /\d{4}W\d{2}/, false],
                ['YYYYDDD', /\d{7}/],
                ['YYYYMM', /\d{6}/, false],
                ['YYYY', /\d{4}/, false],
            ],
            // iso time formats and regexes
            isoTimes = [
                ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
                ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
                ['HH:mm:ss', /\d\d:\d\d:\d\d/],
                ['HH:mm', /\d\d:\d\d/],
                ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
                ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
                ['HHmmss', /\d\d\d\d\d\d/],
                ['HHmm', /\d\d\d\d/],
                ['HH', /\d\d/],
            ],
            aspNetJsonRegex = /^\/?Date\((-?\d+)/i,
            // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
            rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,
            obsOffsets = {
                UT: 0,
                GMT: 0,
                EDT: -4 * 60,
                EST: -5 * 60,
                CDT: -5 * 60,
                CST: -6 * 60,
                MDT: -6 * 60,
                MST: -7 * 60,
                PDT: -7 * 60,
                PST: -8 * 60,
            };

        // date from iso format
        function configFromISO(config) {
            var i,
                l,
                string = config._i,
                match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
                allowTime,
                dateFormat,
                timeFormat,
                tzFormat;

            if (match) {
                getParsingFlags(config).iso = true;

                for (i = 0, l = isoDates.length; i < l; i++) {
                    if (isoDates[i][1].exec(match[1])) {
                        dateFormat = isoDates[i][0];
                        allowTime = isoDates[i][2] !== false;
                        break;
                    }
                }
                if (dateFormat == null) {
                    config._isValid = false;
                    return;
                }
                if (match[3]) {
                    for (i = 0, l = isoTimes.length; i < l; i++) {
                        if (isoTimes[i][1].exec(match[3])) {
                            // match[2] should be 'T' or space
                            timeFormat = (match[2] || ' ') + isoTimes[i][0];
                            break;
                        }
                    }
                    if (timeFormat == null) {
                        config._isValid = false;
                        return;
                    }
                }
                if (!allowTime && timeFormat != null) {
                    config._isValid = false;
                    return;
                }
                if (match[4]) {
                    if (tzRegex.exec(match[4])) {
                        tzFormat = 'Z';
                    } else {
                        config._isValid = false;
                        return;
                    }
                }
                config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
                configFromStringAndFormat(config);
            } else {
                config._isValid = false;
            }
        }

        function extractFromRFC2822Strings(
            yearStr,
            monthStr,
            dayStr,
            hourStr,
            minuteStr,
            secondStr
        ) {
            var result = [
                untruncateYear(yearStr),
                defaultLocaleMonthsShort.indexOf(monthStr),
                parseInt(dayStr, 10),
                parseInt(hourStr, 10),
                parseInt(minuteStr, 10),
            ];

            if (secondStr) {
                result.push(parseInt(secondStr, 10));
            }

            return result;
        }

        function untruncateYear(yearStr) {
            var year = parseInt(yearStr, 10);
            if (year <= 49) {
                return 2000 + year;
            } else if (year <= 999) {
                return 1900 + year;
            }
            return year;
        }

        function preprocessRFC2822(s) {
            // Remove comments and folding whitespace and replace multiple-spaces with a single space
            return s
                .replace(/\([^)]*\)|[\n\t]/g, ' ')
                .replace(/(\s\s+)/g, ' ')
                .replace(/^\s\s*/, '')
                .replace(/\s\s*$/, '');
        }

        function checkWeekday(weekdayStr, parsedInput, config) {
            if (weekdayStr) {
                // TODO: Replace the vanilla JS Date object with an independent day-of-week check.
                var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                    weekdayActual = new Date(
                        parsedInput[0],
                        parsedInput[1],
                        parsedInput[2]
                    ).getDay();
                if (weekdayProvided !== weekdayActual) {
                    getParsingFlags(config).weekdayMismatch = true;
                    config._isValid = false;
                    return false;
                }
            }
            return true;
        }

        function calculateOffset(obsOffset, militaryOffset, numOffset) {
            if (obsOffset) {
                return obsOffsets[obsOffset];
            } else if (militaryOffset) {
                // the only allowed military tz is Z
                return 0;
            } else {
                var hm = parseInt(numOffset, 10),
                    m = hm % 100,
                    h = (hm - m) / 100;
                return h * 60 + m;
            }
        }

        // date and time from ref 2822 format
        function configFromRFC2822(config) {
            var match = rfc2822.exec(preprocessRFC2822(config._i)),
                parsedArray;
            if (match) {
                parsedArray = extractFromRFC2822Strings(
                    match[4],
                    match[3],
                    match[2],
                    match[5],
                    match[6],
                    match[7]
                );
                if (!checkWeekday(match[1], parsedArray, config)) {
                    return;
                }

                config._a = parsedArray;
                config._tzm = calculateOffset(match[8], match[9], match[10]);

                config._d = createUTCDate.apply(null, config._a);
                config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

                getParsingFlags(config).rfc2822 = true;
            } else {
                config._isValid = false;
            }
        }

        // date from 1) ASP.NET, 2) ISO, 3) RFC 2822 formats, or 4) optional fallback if parsing isn't strict
        function configFromString(config) {
            var matched = aspNetJsonRegex.exec(config._i);
            if (matched !== null) {
                config._d = new Date(+matched[1]);
                return;
            }

            configFromISO(config);
            if (config._isValid === false) {
                delete config._isValid;
            } else {
                return;
            }

            configFromRFC2822(config);
            if (config._isValid === false) {
                delete config._isValid;
            } else {
                return;
            }

            if (config._strict) {
                config._isValid = false;
            } else {
                // Final attempt, use Input Fallback
                hooks.createFromInputFallback(config);
            }
        }

        hooks.createFromInputFallback = deprecate(
            'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
                'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
                'discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.',
            function (config) {
                config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
            }
        );

        // Pick the first defined of two or three arguments.
        function defaults(a, b, c) {
            if (a != null) {
                return a;
            }
            if (b != null) {
                return b;
            }
            return c;
        }

        function currentDateArray(config) {
            // hooks is actually the exported moment object
            var nowValue = new Date(hooks.now());
            if (config._useUTC) {
                return [
                    nowValue.getUTCFullYear(),
                    nowValue.getUTCMonth(),
                    nowValue.getUTCDate(),
                ];
            }
            return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
        }

        // convert an array to a date.
        // the array should mirror the parameters below
        // note: all values past the year are optional and will default to the lowest possible value.
        // [year, month, day , hour, minute, second, millisecond]
        function configFromArray(config) {
            var i,
                date,
                input = [],
                currentDate,
                expectedWeekday,
                yearToUse;

            if (config._d) {
                return;
            }

            currentDate = currentDateArray(config);

            //compute day of the year from weeks and weekdays
            if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
                dayOfYearFromWeekInfo(config);
            }

            //if the day of the year is set, figure out what it is
            if (config._dayOfYear != null) {
                yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

                if (
                    config._dayOfYear > daysInYear(yearToUse) ||
                    config._dayOfYear === 0
                ) {
                    getParsingFlags(config)._overflowDayOfYear = true;
                }

                date = createUTCDate(yearToUse, 0, config._dayOfYear);
                config._a[MONTH] = date.getUTCMonth();
                config._a[DATE] = date.getUTCDate();
            }

            // Default to current date.
            // * if no year, month, day of month are given, default to today
            // * if day of month is given, default month and year
            // * if month is given, default only year
            // * if year is given, don't default anything
            for (i = 0; i < 3 && config._a[i] == null; ++i) {
                config._a[i] = input[i] = currentDate[i];
            }

            // Zero out whatever was not defaulted, including time
            for (; i < 7; i++) {
                config._a[i] = input[i] =
                    config._a[i] == null ? (i === 2 ? 1 : 0) : config._a[i];
            }

            // Check for 24:00:00.000
            if (
                config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0
            ) {
                config._nextDay = true;
                config._a[HOUR] = 0;
            }

            config._d = (config._useUTC ? createUTCDate : createDate).apply(
                null,
                input
            );
            expectedWeekday = config._useUTC
                ? config._d.getUTCDay()
                : config._d.getDay();

            // Apply timezone offset from input. The actual utcOffset can be changed
            // with parseZone.
            if (config._tzm != null) {
                config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
            }

            if (config._nextDay) {
                config._a[HOUR] = 24;
            }

            // check for mismatching day of week
            if (
                config._w &&
                typeof config._w.d !== 'undefined' &&
                config._w.d !== expectedWeekday
            ) {
                getParsingFlags(config).weekdayMismatch = true;
            }
        }

        function dayOfYearFromWeekInfo(config) {
            var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow, curWeek;

            w = config._w;
            if (w.GG != null || w.W != null || w.E != null) {
                dow = 1;
                doy = 4;

                // TODO: We need to take the current isoWeekYear, but that depends on
                // how we interpret now (local, utc, fixed offset). So create
                // a now version of current config (take local/utc/offset flags, and
                // create now).
                weekYear = defaults(
                    w.GG,
                    config._a[YEAR],
                    weekOfYear(createLocal(), 1, 4).year
                );
                week = defaults(w.W, 1);
                weekday = defaults(w.E, 1);
                if (weekday < 1 || weekday > 7) {
                    weekdayOverflow = true;
                }
            } else {
                dow = config._locale._week.dow;
                doy = config._locale._week.doy;

                curWeek = weekOfYear(createLocal(), dow, doy);

                weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

                // Default to current week.
                week = defaults(w.w, curWeek.week);

                if (w.d != null) {
                    // weekday -- low day numbers are considered next week
                    weekday = w.d;
                    if (weekday < 0 || weekday > 6) {
                        weekdayOverflow = true;
                    }
                } else if (w.e != null) {
                    // local weekday -- counting starts from beginning of week
                    weekday = w.e + dow;
                    if (w.e < 0 || w.e > 6) {
                        weekdayOverflow = true;
                    }
                } else {
                    // default to beginning of week
                    weekday = dow;
                }
            }
            if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
                getParsingFlags(config)._overflowWeeks = true;
            } else if (weekdayOverflow != null) {
                getParsingFlags(config)._overflowWeekday = true;
            } else {
                temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
                config._a[YEAR] = temp.year;
                config._dayOfYear = temp.dayOfYear;
            }
        }

        // constant that refers to the ISO standard
        hooks.ISO_8601 = function () {};

        // constant that refers to the RFC 2822 form
        hooks.RFC_2822 = function () {};

        // date from string and format string
        function configFromStringAndFormat(config) {
            // TODO: Move this to another part of the creation flow to prevent circular deps
            if (config._f === hooks.ISO_8601) {
                configFromISO(config);
                return;
            }
            if (config._f === hooks.RFC_2822) {
                configFromRFC2822(config);
                return;
            }
            config._a = [];
            getParsingFlags(config).empty = true;

            // This array is used to make a Date, either with `new Date` or `Date.UTC`
            var string = '' + config._i,
                i,
                parsedInput,
                tokens,
                token,
                skipped,
                stringLength = string.length,
                totalParsedInputLength = 0,
                era;

            tokens =
                expandFormat(config._f, config._locale).match(formattingTokens) || [];

            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];
                parsedInput = (string.match(getParseRegexForToken(token, config)) ||
                    [])[0];
                if (parsedInput) {
                    skipped = string.substr(0, string.indexOf(parsedInput));
                    if (skipped.length > 0) {
                        getParsingFlags(config).unusedInput.push(skipped);
                    }
                    string = string.slice(
                        string.indexOf(parsedInput) + parsedInput.length
                    );
                    totalParsedInputLength += parsedInput.length;
                }
                // don't parse if it's not a known token
                if (formatTokenFunctions[token]) {
                    if (parsedInput) {
                        getParsingFlags(config).empty = false;
                    } else {
                        getParsingFlags(config).unusedTokens.push(token);
                    }
                    addTimeToArrayFromToken(token, parsedInput, config);
                } else if (config._strict && !parsedInput) {
                    getParsingFlags(config).unusedTokens.push(token);
                }
            }

            // add remaining unparsed input length to the string
            getParsingFlags(config).charsLeftOver =
                stringLength - totalParsedInputLength;
            if (string.length > 0) {
                getParsingFlags(config).unusedInput.push(string);
            }

            // clear _12h flag if hour is <= 12
            if (
                config._a[HOUR] <= 12 &&
                getParsingFlags(config).bigHour === true &&
                config._a[HOUR] > 0
            ) {
                getParsingFlags(config).bigHour = undefined;
            }

            getParsingFlags(config).parsedDateParts = config._a.slice(0);
            getParsingFlags(config).meridiem = config._meridiem;
            // handle meridiem
            config._a[HOUR] = meridiemFixWrap(
                config._locale,
                config._a[HOUR],
                config._meridiem
            );

            // handle era
            era = getParsingFlags(config).era;
            if (era !== null) {
                config._a[YEAR] = config._locale.erasConvertYear(era, config._a[YEAR]);
            }

            configFromArray(config);
            checkOverflow(config);
        }

        function meridiemFixWrap(locale, hour, meridiem) {
            var isPm;

            if (meridiem == null) {
                // nothing to do
                return hour;
            }
            if (locale.meridiemHour != null) {
                return locale.meridiemHour(hour, meridiem);
            } else if (locale.isPM != null) {
                // Fallback
                isPm = locale.isPM(meridiem);
                if (isPm && hour < 12) {
                    hour += 12;
                }
                if (!isPm && hour === 12) {
                    hour = 0;
                }
                return hour;
            } else {
                // this is not supposed to happen
                return hour;
            }
        }

        // date from string and array of format strings
        function configFromStringAndArray(config) {
            var tempConfig,
                bestMoment,
                scoreToBeat,
                i,
                currentScore,
                validFormatFound,
                bestFormatIsValid = false;

            if (config._f.length === 0) {
                getParsingFlags(config).invalidFormat = true;
                config._d = new Date(NaN);
                return;
            }

            for (i = 0; i < config._f.length; i++) {
                currentScore = 0;
                validFormatFound = false;
                tempConfig = copyConfig({}, config);
                if (config._useUTC != null) {
                    tempConfig._useUTC = config._useUTC;
                }
                tempConfig._f = config._f[i];
                configFromStringAndFormat(tempConfig);

                if (isValid(tempConfig)) {
                    validFormatFound = true;
                }

                // if there is any input that was not parsed add a penalty for that format
                currentScore += getParsingFlags(tempConfig).charsLeftOver;

                //or tokens
                currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

                getParsingFlags(tempConfig).score = currentScore;

                if (!bestFormatIsValid) {
                    if (
                        scoreToBeat == null ||
                        currentScore < scoreToBeat ||
                        validFormatFound
                    ) {
                        scoreToBeat = currentScore;
                        bestMoment = tempConfig;
                        if (validFormatFound) {
                            bestFormatIsValid = true;
                        }
                    }
                } else {
                    if (currentScore < scoreToBeat) {
                        scoreToBeat = currentScore;
                        bestMoment = tempConfig;
                    }
                }
            }

            extend(config, bestMoment || tempConfig);
        }

        function configFromObject(config) {
            if (config._d) {
                return;
            }

            var i = normalizeObjectUnits(config._i),
                dayOrDate = i.day === undefined ? i.date : i.day;
            config._a = map(
                [i.year, i.month, dayOrDate, i.hour, i.minute, i.second, i.millisecond],
                function (obj) {
                    return obj && parseInt(obj, 10);
                }
            );

            configFromArray(config);
        }

        function createFromConfig(config) {
            var res = new Moment(checkOverflow(prepareConfig(config)));
            if (res._nextDay) {
                // Adding is smart enough around DST
                res.add(1, 'd');
                res._nextDay = undefined;
            }

            return res;
        }

        function prepareConfig(config) {
            var input = config._i,
                format = config._f;

            config._locale = config._locale || getLocale(config._l);

            if (input === null || (format === undefined && input === '')) {
                return createInvalid({ nullInput: true });
            }

            if (typeof input === 'string') {
                config._i = input = config._locale.preparse(input);
            }

            if (isMoment(input)) {
                return new Moment(checkOverflow(input));
            } else if (isDate(input)) {
                config._d = input;
            } else if (isArray(format)) {
                configFromStringAndArray(config);
            } else if (format) {
                configFromStringAndFormat(config);
            } else {
                configFromInput(config);
            }

            if (!isValid(config)) {
                config._d = null;
            }

            return config;
        }

        function configFromInput(config) {
            var input = config._i;
            if (isUndefined(input)) {
                config._d = new Date(hooks.now());
            } else if (isDate(input)) {
                config._d = new Date(input.valueOf());
            } else if (typeof input === 'string') {
                configFromString(config);
            } else if (isArray(input)) {
                config._a = map(input.slice(0), function (obj) {
                    return parseInt(obj, 10);
                });
                configFromArray(config);
            } else if (isObject(input)) {
                configFromObject(config);
            } else if (isNumber(input)) {
                // from milliseconds
                config._d = new Date(input);
            } else {
                hooks.createFromInputFallback(config);
            }
        }

        function createLocalOrUTC(input, format, locale, strict, isUTC) {
            var c = {};

            if (format === true || format === false) {
                strict = format;
                format = undefined;
            }

            if (locale === true || locale === false) {
                strict = locale;
                locale = undefined;
            }

            if (
                (isObject(input) && isObjectEmpty(input)) ||
                (isArray(input) && input.length === 0)
            ) {
                input = undefined;
            }
            // object construction must be done this way.
            // https://github.com/moment/moment/issues/1423
            c._isAMomentObject = true;
            c._useUTC = c._isUTC = isUTC;
            c._l = locale;
            c._i = input;
            c._f = format;
            c._strict = strict;

            return createFromConfig(c);
        }

        function createLocal(input, format, locale, strict) {
            return createLocalOrUTC(input, format, locale, strict, false);
        }

        var prototypeMin = deprecate(
                'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
                function () {
                    var other = createLocal.apply(null, arguments);
                    if (this.isValid() && other.isValid()) {
                        return other < this ? this : other;
                    } else {
                        return createInvalid();
                    }
                }
            ),
            prototypeMax = deprecate(
                'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
                function () {
                    var other = createLocal.apply(null, arguments);
                    if (this.isValid() && other.isValid()) {
                        return other > this ? this : other;
                    } else {
                        return createInvalid();
                    }
                }
            );

        // Pick a moment m from moments so that m[fn](other) is true for all
        // other. This relies on the function fn to be transitive.
        //
        // moments should either be an array of moment objects or an array, whose
        // first element is an array of moment objects.
        function pickBy(fn, moments) {
            var res, i;
            if (moments.length === 1 && isArray(moments[0])) {
                moments = moments[0];
            }
            if (!moments.length) {
                return createLocal();
            }
            res = moments[0];
            for (i = 1; i < moments.length; ++i) {
                if (!moments[i].isValid() || moments[i][fn](res)) {
                    res = moments[i];
                }
            }
            return res;
        }

        // TODO: Use [].sort instead?
        function min() {
            var args = [].slice.call(arguments, 0);

            return pickBy('isBefore', args);
        }

        function max() {
            var args = [].slice.call(arguments, 0);

            return pickBy('isAfter', args);
        }

        var now = function () {
            return Date.now ? Date.now() : +new Date();
        };

        var ordering = [
            'year',
            'quarter',
            'month',
            'week',
            'day',
            'hour',
            'minute',
            'second',
            'millisecond',
        ];

        function isDurationValid(m) {
            var key,
                unitHasDecimal = false,
                i;
            for (key in m) {
                if (
                    hasOwnProp(m, key) &&
                    !(
                        indexOf.call(ordering, key) !== -1 &&
                        (m[key] == null || !isNaN(m[key]))
                    )
                ) {
                    return false;
                }
            }

            for (i = 0; i < ordering.length; ++i) {
                if (m[ordering[i]]) {
                    if (unitHasDecimal) {
                        return false; // only allow non-integers for smallest unit
                    }
                    if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                        unitHasDecimal = true;
                    }
                }
            }

            return true;
        }

        function isValid$1() {
            return this._isValid;
        }

        function createInvalid$1() {
            return createDuration(NaN);
        }

        function Duration(duration) {
            var normalizedInput = normalizeObjectUnits(duration),
                years = normalizedInput.year || 0,
                quarters = normalizedInput.quarter || 0,
                months = normalizedInput.month || 0,
                weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
                days = normalizedInput.day || 0,
                hours = normalizedInput.hour || 0,
                minutes = normalizedInput.minute || 0,
                seconds = normalizedInput.second || 0,
                milliseconds = normalizedInput.millisecond || 0;

            this._isValid = isDurationValid(normalizedInput);

            // representation for dateAddRemove
            this._milliseconds =
                +milliseconds +
                seconds * 1e3 + // 1000
                minutes * 6e4 + // 1000 * 60
                hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
            // Because of dateAddRemove treats 24 hours as different from a
            // day when working around DST, we need to store them separately
            this._days = +days + weeks * 7;
            // It is impossible to translate months into days without knowing
            // which months you are are talking about, so we have to store
            // it separately.
            this._months = +months + quarters * 3 + years * 12;

            this._data = {};

            this._locale = getLocale();

            this._bubble();
        }

        function isDuration(obj) {
            return obj instanceof Duration;
        }

        function absRound(number) {
            if (number < 0) {
                return Math.round(-1 * number) * -1;
            } else {
                return Math.round(number);
            }
        }

        // compare two arrays, return the number of differences
        function compareArrays(array1, array2, dontConvert) {
            var len = Math.min(array1.length, array2.length),
                lengthDiff = Math.abs(array1.length - array2.length),
                diffs = 0,
                i;
            for (i = 0; i < len; i++) {
                if (
                    (dontConvert && array1[i] !== array2[i]) ||
                    (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))
                ) {
                    diffs++;
                }
            }
            return diffs + lengthDiff;
        }

        // FORMATTING

        function offset(token, separator) {
            addFormatToken(token, 0, 0, function () {
                var offset = this.utcOffset(),
                    sign = '+';
                if (offset < 0) {
                    offset = -offset;
                    sign = '-';
                }
                return (
                    sign +
                    zeroFill(~~(offset / 60), 2) +
                    separator +
                    zeroFill(~~offset % 60, 2)
                );
            });
        }

        offset('Z', ':');
        offset('ZZ', '');

        // PARSING

        addRegexToken('Z', matchShortOffset);
        addRegexToken('ZZ', matchShortOffset);
        addParseToken(['Z', 'ZZ'], function (input, array, config) {
            config._useUTC = true;
            config._tzm = offsetFromString(matchShortOffset, input);
        });

        // HELPERS

        // timezone chunker
        // '+10:00' > ['10',  '00']
        // '-1530'  > ['-15', '30']
        var chunkOffset = /([\+\-]|\d\d)/gi;

        function offsetFromString(matcher, string) {
            var matches = (string || '').match(matcher),
                chunk,
                parts,
                minutes;

            if (matches === null) {
                return null;
            }

            chunk = matches[matches.length - 1] || [];
            parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
            minutes = +(parts[1] * 60) + toInt(parts[2]);

            return minutes === 0 ? 0 : parts[0] === '+' ? minutes : -minutes;
        }

        // Return a moment from input, that is local/utc/zone equivalent to model.
        function cloneWithOffset(input, model) {
            var res, diff;
            if (model._isUTC) {
                res = model.clone();
                diff =
                    (isMoment(input) || isDate(input)
                        ? input.valueOf()
                        : createLocal(input).valueOf()) - res.valueOf();
                // Use low-level api, because this fn is low-level api.
                res._d.setTime(res._d.valueOf() + diff);
                hooks.updateOffset(res, false);
                return res;
            } else {
                return createLocal(input).local();
            }
        }

        function getDateOffset(m) {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return -Math.round(m._d.getTimezoneOffset());
        }

        // HOOKS

        // This function will be called whenever a moment is mutated.
        // It is intended to keep the offset in sync with the timezone.
        hooks.updateOffset = function () {};

        // MOMENTS

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        function getSetOffset(input, keepLocalTime, keepMinutes) {
            var offset = this._offset || 0,
                localAdjust;
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            if (input != null) {
                if (typeof input === 'string') {
                    input = offsetFromString(matchShortOffset, input);
                    if (input === null) {
                        return this;
                    }
                } else if (Math.abs(input) < 16 && !keepMinutes) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = getDateOffset(this);
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.add(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addSubtract(
                            this,
                            createDuration(input - offset, 'm'),
                            1,
                            false
                        );
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        hooks.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
                return this;
            } else {
                return this._isUTC ? offset : getDateOffset(this);
            }
        }

        function getSetZone(input, keepLocalTime) {
            if (input != null) {
                if (typeof input !== 'string') {
                    input = -input;
                }

                this.utcOffset(input, keepLocalTime);

                return this;
            } else {
                return -this.utcOffset();
            }
        }

        function setOffsetToUTC(keepLocalTime) {
            return this.utcOffset(0, keepLocalTime);
        }

        function setOffsetToLocal(keepLocalTime) {
            if (this._isUTC) {
                this.utcOffset(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.subtract(getDateOffset(this), 'm');
                }
            }
            return this;
        }

        function setOffsetToParsedOffset() {
            if (this._tzm != null) {
                this.utcOffset(this._tzm, false, true);
            } else if (typeof this._i === 'string') {
                var tZone = offsetFromString(matchOffset, this._i);
                if (tZone != null) {
                    this.utcOffset(tZone);
                } else {
                    this.utcOffset(0, true);
                }
            }
            return this;
        }

        function hasAlignedHourOffset(input) {
            if (!this.isValid()) {
                return false;
            }
            input = input ? createLocal(input).utcOffset() : 0;

            return (this.utcOffset() - input) % 60 === 0;
        }

        function isDaylightSavingTime() {
            return (
                this.utcOffset() > this.clone().month(0).utcOffset() ||
                this.utcOffset() > this.clone().month(5).utcOffset()
            );
        }

        function isDaylightSavingTimeShifted() {
            if (!isUndefined(this._isDSTShifted)) {
                return this._isDSTShifted;
            }

            var c = {},
                other;

            copyConfig(c, this);
            c = prepareConfig(c);

            if (c._a) {
                other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
                this._isDSTShifted =
                    this.isValid() && compareArrays(c._a, other.toArray()) > 0;
            } else {
                this._isDSTShifted = false;
            }

            return this._isDSTShifted;
        }

        function isLocal() {
            return this.isValid() ? !this._isUTC : false;
        }

        function isUtcOffset() {
            return this.isValid() ? this._isUTC : false;
        }

        function isUtc() {
            return this.isValid() ? this._isUTC && this._offset === 0 : false;
        }

        // ASP.NET json date format regex
        var aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,
            // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
            // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
            // and further modified to allow for strings containing both week and day
            isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

        function createDuration(input, key) {
            var duration = input,
                // matching against regexp is expensive, do it on demand
                match = null,
                sign,
                ret,
                diffRes;

            if (isDuration(input)) {
                duration = {
                    ms: input._milliseconds,
                    d: input._days,
                    M: input._months,
                };
            } else if (isNumber(input) || !isNaN(+input)) {
                duration = {};
                if (key) {
                    duration[key] = +input;
                } else {
                    duration.milliseconds = +input;
                }
            } else if ((match = aspNetRegex.exec(input))) {
                sign = match[1] === '-' ? -1 : 1;
                duration = {
                    y: 0,
                    d: toInt(match[DATE]) * sign,
                    h: toInt(match[HOUR]) * sign,
                    m: toInt(match[MINUTE]) * sign,
                    s: toInt(match[SECOND]) * sign,
                    ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign, // the millisecond decimal point is included in the match
                };
            } else if ((match = isoRegex.exec(input))) {
                sign = match[1] === '-' ? -1 : 1;
                duration = {
                    y: parseIso(match[2], sign),
                    M: parseIso(match[3], sign),
                    w: parseIso(match[4], sign),
                    d: parseIso(match[5], sign),
                    h: parseIso(match[6], sign),
                    m: parseIso(match[7], sign),
                    s: parseIso(match[8], sign),
                };
            } else if (duration == null) {
                // checks for null or undefined
                duration = {};
            } else if (
                typeof duration === 'object' &&
                ('from' in duration || 'to' in duration)
            ) {
                diffRes = momentsDifference(
                    createLocal(duration.from),
                    createLocal(duration.to)
                );

                duration = {};
                duration.ms = diffRes.milliseconds;
                duration.M = diffRes.months;
            }

            ret = new Duration(duration);

            if (isDuration(input) && hasOwnProp(input, '_locale')) {
                ret._locale = input._locale;
            }

            if (isDuration(input) && hasOwnProp(input, '_isValid')) {
                ret._isValid = input._isValid;
            }

            return ret;
        }

        createDuration.fn = Duration.prototype;
        createDuration.invalid = createInvalid$1;

        function parseIso(inp, sign) {
            // We'd normally use ~~inp for this, but unfortunately it also
            // converts floats to ints.
            // inp may be undefined, so careful calling replace on it.
            var res = inp && parseFloat(inp.replace(',', '.'));
            // apply sign while we're at it
            return (isNaN(res) ? 0 : res) * sign;
        }

        function positiveMomentsDifference(base, other) {
            var res = {};

            res.months =
                other.month() - base.month() + (other.year() - base.year()) * 12;
            if (base.clone().add(res.months, 'M').isAfter(other)) {
                --res.months;
            }

            res.milliseconds = +other - +base.clone().add(res.months, 'M');

            return res;
        }

        function momentsDifference(base, other) {
            var res;
            if (!(base.isValid() && other.isValid())) {
                return { milliseconds: 0, months: 0 };
            }

            other = cloneWithOffset(other, base);
            if (base.isBefore(other)) {
                res = positiveMomentsDifference(base, other);
            } else {
                res = positiveMomentsDifference(other, base);
                res.milliseconds = -res.milliseconds;
                res.months = -res.months;
            }

            return res;
        }

        // TODO: remove 'name' arg after deprecation is removed
        function createAdder(direction, name) {
            return function (val, period) {
                var dur, tmp;
                //invert the arguments, but complain about it
                if (period !== null && !isNaN(+period)) {
                    deprecateSimple(
                        name,
                        'moment().' +
                            name +
                            '(period, number) is deprecated. Please use moment().' +
                            name +
                            '(number, period). ' +
                            'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.'
                    );
                    tmp = val;
                    val = period;
                    period = tmp;
                }

                dur = createDuration(val, period);
                addSubtract(this, dur, direction);
                return this;
            };
        }

        function addSubtract(mom, duration, isAdding, updateOffset) {
            var milliseconds = duration._milliseconds,
                days = absRound(duration._days),
                months = absRound(duration._months);

            if (!mom.isValid()) {
                // No op
                return;
            }

            updateOffset = updateOffset == null ? true : updateOffset;

            if (months) {
                setMonth(mom, get(mom, 'Month') + months * isAdding);
            }
            if (days) {
                set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
            }
            if (milliseconds) {
                mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
            }
            if (updateOffset) {
                hooks.updateOffset(mom, days || months);
            }
        }

        var add = createAdder(1, 'add'),
            subtract = createAdder(-1, 'subtract');

        function isString(input) {
            return typeof input === 'string' || input instanceof String;
        }

        // type MomentInput = Moment | Date | string | number | (number | string)[] | MomentInputObject | void; // null | undefined
        function isMomentInput(input) {
            return (
                isMoment(input) ||
                isDate(input) ||
                isString(input) ||
                isNumber(input) ||
                isNumberOrStringArray(input) ||
                isMomentInputObject(input) ||
                input === null ||
                input === undefined
            );
        }

        function isMomentInputObject(input) {
            var objectTest = isObject(input) && !isObjectEmpty(input),
                propertyTest = false,
                properties = [
                    'years',
                    'year',
                    'y',
                    'months',
                    'month',
                    'M',
                    'days',
                    'day',
                    'd',
                    'dates',
                    'date',
                    'D',
                    'hours',
                    'hour',
                    'h',
                    'minutes',
                    'minute',
                    'm',
                    'seconds',
                    'second',
                    's',
                    'milliseconds',
                    'millisecond',
                    'ms',
                ],
                i,
                property;

            for (i = 0; i < properties.length; i += 1) {
                property = properties[i];
                propertyTest = propertyTest || hasOwnProp(input, property);
            }

            return objectTest && propertyTest;
        }

        function isNumberOrStringArray(input) {
            var arrayTest = isArray(input),
                dataTypeTest = false;
            if (arrayTest) {
                dataTypeTest =
                    input.filter(function (item) {
                        return !isNumber(item) && isString(input);
                    }).length === 0;
            }
            return arrayTest && dataTypeTest;
        }

        function isCalendarSpec(input) {
            var objectTest = isObject(input) && !isObjectEmpty(input),
                propertyTest = false,
                properties = [
                    'sameDay',
                    'nextDay',
                    'lastDay',
                    'nextWeek',
                    'lastWeek',
                    'sameElse',
                ],
                i,
                property;

            for (i = 0; i < properties.length; i += 1) {
                property = properties[i];
                propertyTest = propertyTest || hasOwnProp(input, property);
            }

            return objectTest && propertyTest;
        }

        function getCalendarFormat(myMoment, now) {
            var diff = myMoment.diff(now, 'days', true);
            return diff < -6
                ? 'sameElse'
                : diff < -1
                ? 'lastWeek'
                : diff < 0
                ? 'lastDay'
                : diff < 1
                ? 'sameDay'
                : diff < 2
                ? 'nextDay'
                : diff < 7
                ? 'nextWeek'
                : 'sameElse';
        }

        function calendar$1(time, formats) {
            // Support for single parameter, formats only overload to the calendar function
            if (arguments.length === 1) {
                if (!arguments[0]) {
                    time = undefined;
                    formats = undefined;
                } else if (isMomentInput(arguments[0])) {
                    time = arguments[0];
                    formats = undefined;
                } else if (isCalendarSpec(arguments[0])) {
                    formats = arguments[0];
                    time = undefined;
                }
            }
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're local/utc/offset or not.
            var now = time || createLocal(),
                sod = cloneWithOffset(now, this).startOf('day'),
                format = hooks.calendarFormat(this, sod) || 'sameElse',
                output =
                    formats &&
                    (isFunction(formats[format])
                        ? formats[format].call(this, now)
                        : formats[format]);

            return this.format(
                output || this.localeData().calendar(format, this, createLocal(now))
            );
        }

        function clone() {
            return new Moment(this);
        }

        function isAfter(input, units) {
            var localInput = isMoment(input) ? input : createLocal(input);
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units) || 'millisecond';
            if (units === 'millisecond') {
                return this.valueOf() > localInput.valueOf();
            } else {
                return localInput.valueOf() < this.clone().startOf(units).valueOf();
            }
        }

        function isBefore(input, units) {
            var localInput = isMoment(input) ? input : createLocal(input);
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units) || 'millisecond';
            if (units === 'millisecond') {
                return this.valueOf() < localInput.valueOf();
            } else {
                return this.clone().endOf(units).valueOf() < localInput.valueOf();
            }
        }

        function isBetween(from, to, units, inclusivity) {
            var localFrom = isMoment(from) ? from : createLocal(from),
                localTo = isMoment(to) ? to : createLocal(to);
            if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
                return false;
            }
            inclusivity = inclusivity || '()';
            return (
                (inclusivity[0] === '('
                    ? this.isAfter(localFrom, units)
                    : !this.isBefore(localFrom, units)) &&
                (inclusivity[1] === ')'
                    ? this.isBefore(localTo, units)
                    : !this.isAfter(localTo, units))
            );
        }

        function isSame(input, units) {
            var localInput = isMoment(input) ? input : createLocal(input),
                inputMs;
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units) || 'millisecond';
            if (units === 'millisecond') {
                return this.valueOf() === localInput.valueOf();
            } else {
                inputMs = localInput.valueOf();
                return (
                    this.clone().startOf(units).valueOf() <= inputMs &&
                    inputMs <= this.clone().endOf(units).valueOf()
                );
            }
        }

        function isSameOrAfter(input, units) {
            return this.isSame(input, units) || this.isAfter(input, units);
        }

        function isSameOrBefore(input, units) {
            return this.isSame(input, units) || this.isBefore(input, units);
        }

        function diff(input, units, asFloat) {
            var that, zoneDelta, output;

            if (!this.isValid()) {
                return NaN;
            }

            that = cloneWithOffset(input, this);

            if (!that.isValid()) {
                return NaN;
            }

            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

            units = normalizeUnits(units);

            switch (units) {
                case 'year':
                    output = monthDiff(this, that) / 12;
                    break;
                case 'month':
                    output = monthDiff(this, that);
                    break;
                case 'quarter':
                    output = monthDiff(this, that) / 3;
                    break;
                case 'second':
                    output = (this - that) / 1e3;
                    break; // 1000
                case 'minute':
                    output = (this - that) / 6e4;
                    break; // 1000 * 60
                case 'hour':
                    output = (this - that) / 36e5;
                    break; // 1000 * 60 * 60
                case 'day':
                    output = (this - that - zoneDelta) / 864e5;
                    break; // 1000 * 60 * 60 * 24, negate dst
                case 'week':
                    output = (this - that - zoneDelta) / 6048e5;
                    break; // 1000 * 60 * 60 * 24 * 7, negate dst
                default:
                    output = this - that;
            }

            return asFloat ? output : absFloor(output);
        }

        function monthDiff(a, b) {
            if (a.date() < b.date()) {
                // end-of-month calculations work correct when the start month has more
                // days than the end month.
                return -monthDiff(b, a);
            }
            // difference in months
            var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),
                // b is in (anchor - 1 month, anchor + 1 month)
                anchor = a.clone().add(wholeMonthDiff, 'months'),
                anchor2,
                adjust;

            if (b - anchor < 0) {
                anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
                // linear across the month
                adjust = (b - anchor) / (anchor - anchor2);
            } else {
                anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
                // linear across the month
                adjust = (b - anchor) / (anchor2 - anchor);
            }

            //check for negative zero, return zero if negative zero
            return -(wholeMonthDiff + adjust) || 0;
        }

        hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
        hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

        function toString() {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        }

        function toISOString(keepOffset) {
            if (!this.isValid()) {
                return null;
            }
            var utc = keepOffset !== true,
                m = utc ? this.clone().utc() : this;
            if (m.year() < 0 || m.year() > 9999) {
                return formatMoment(
                    m,
                    utc
                        ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
                        : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ'
                );
            }
            if (isFunction(Date.prototype.toISOString)) {
                // native implementation is ~50x faster, use it when we can
                if (utc) {
                    return this.toDate().toISOString();
                } else {
                    return new Date(this.valueOf() + this.utcOffset() * 60 * 1000)
                        .toISOString()
                        .replace('Z', formatMoment(m, 'Z'));
                }
            }
            return formatMoment(
                m,
                utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
            );
        }

        /**
         * Return a human readable representation of a moment that can
         * also be evaluated to get a new moment which is the same
         *
         * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
         */
        function inspect() {
            if (!this.isValid()) {
                return 'moment.invalid(/* ' + this._i + ' */)';
            }
            var func = 'moment',
                zone = '',
                prefix,
                year,
                datetime,
                suffix;
            if (!this.isLocal()) {
                func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
                zone = 'Z';
            }
            prefix = '[' + func + '("]';
            year = 0 <= this.year() && this.year() <= 9999 ? 'YYYY' : 'YYYYYY';
            datetime = '-MM-DD[T]HH:mm:ss.SSS';
            suffix = zone + '[")]';

            return this.format(prefix + year + datetime + suffix);
        }

        function format(inputString) {
            if (!inputString) {
                inputString = this.isUtc()
                    ? hooks.defaultFormatUtc
                    : hooks.defaultFormat;
            }
            var output = formatMoment(this, inputString);
            return this.localeData().postformat(output);
        }

        function from(time, withoutSuffix) {
            if (
                this.isValid() &&
                ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
            ) {
                return createDuration({ to: this, from: time })
                    .locale(this.locale())
                    .humanize(!withoutSuffix);
            } else {
                return this.localeData().invalidDate();
            }
        }

        function fromNow(withoutSuffix) {
            return this.from(createLocal(), withoutSuffix);
        }

        function to(time, withoutSuffix) {
            if (
                this.isValid() &&
                ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
            ) {
                return createDuration({ from: this, to: time })
                    .locale(this.locale())
                    .humanize(!withoutSuffix);
            } else {
                return this.localeData().invalidDate();
            }
        }

        function toNow(withoutSuffix) {
            return this.to(createLocal(), withoutSuffix);
        }

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        function locale(key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = getLocale(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        }

        var lang = deprecate(
            'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
            function (key) {
                if (key === undefined) {
                    return this.localeData();
                } else {
                    return this.locale(key);
                }
            }
        );

        function localeData() {
            return this._locale;
        }

        var MS_PER_SECOND = 1000,
            MS_PER_MINUTE = 60 * MS_PER_SECOND,
            MS_PER_HOUR = 60 * MS_PER_MINUTE,
            MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

        // actual modulo - handles negative numbers (for dates before 1970):
        function mod$1(dividend, divisor) {
            return ((dividend % divisor) + divisor) % divisor;
        }

        function localStartOfDate(y, m, d) {
            // the date constructor remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0) {
                // preserve leap years using a full 400 year cycle, then reset
                return new Date(y + 400, m, d) - MS_PER_400_YEARS;
            } else {
                return new Date(y, m, d).valueOf();
            }
        }

        function utcStartOfDate(y, m, d) {
            // Date.UTC remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0) {
                // preserve leap years using a full 400 year cycle, then reset
                return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
            } else {
                return Date.UTC(y, m, d);
            }
        }

        function startOf(units) {
            var time, startOfDate;
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond' || !this.isValid()) {
                return this;
            }

            startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

            switch (units) {
                case 'year':
                    time = startOfDate(this.year(), 0, 1);
                    break;
                case 'quarter':
                    time = startOfDate(
                        this.year(),
                        this.month() - (this.month() % 3),
                        1
                    );
                    break;
                case 'month':
                    time = startOfDate(this.year(), this.month(), 1);
                    break;
                case 'week':
                    time = startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - this.weekday()
                    );
                    break;
                case 'isoWeek':
                    time = startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - (this.isoWeekday() - 1)
                    );
                    break;
                case 'day':
                case 'date':
                    time = startOfDate(this.year(), this.month(), this.date());
                    break;
                case 'hour':
                    time = this._d.valueOf();
                    time -= mod$1(
                        time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                        MS_PER_HOUR
                    );
                    break;
                case 'minute':
                    time = this._d.valueOf();
                    time -= mod$1(time, MS_PER_MINUTE);
                    break;
                case 'second':
                    time = this._d.valueOf();
                    time -= mod$1(time, MS_PER_SECOND);
                    break;
            }

            this._d.setTime(time);
            hooks.updateOffset(this, true);
            return this;
        }

        function endOf(units) {
            var time, startOfDate;
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond' || !this.isValid()) {
                return this;
            }

            startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

            switch (units) {
                case 'year':
                    time = startOfDate(this.year() + 1, 0, 1) - 1;
                    break;
                case 'quarter':
                    time =
                        startOfDate(
                            this.year(),
                            this.month() - (this.month() % 3) + 3,
                            1
                        ) - 1;
                    break;
                case 'month':
                    time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                    break;
                case 'week':
                    time =
                        startOfDate(
                            this.year(),
                            this.month(),
                            this.date() - this.weekday() + 7
                        ) - 1;
                    break;
                case 'isoWeek':
                    time =
                        startOfDate(
                            this.year(),
                            this.month(),
                            this.date() - (this.isoWeekday() - 1) + 7
                        ) - 1;
                    break;
                case 'day':
                case 'date':
                    time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                    break;
                case 'hour':
                    time = this._d.valueOf();
                    time +=
                        MS_PER_HOUR -
                        mod$1(
                            time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                            MS_PER_HOUR
                        ) -
                        1;
                    break;
                case 'minute':
                    time = this._d.valueOf();
                    time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                    break;
                case 'second':
                    time = this._d.valueOf();
                    time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                    break;
            }

            this._d.setTime(time);
            hooks.updateOffset(this, true);
            return this;
        }

        function valueOf() {
            return this._d.valueOf() - (this._offset || 0) * 60000;
        }

        function unix() {
            return Math.floor(this.valueOf() / 1000);
        }

        function toDate() {
            return new Date(this.valueOf());
        }

        function toArray() {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hour(),
                m.minute(),
                m.second(),
                m.millisecond(),
            ];
        }

        function toObject() {
            var m = this;
            return {
                years: m.year(),
                months: m.month(),
                date: m.date(),
                hours: m.hours(),
                minutes: m.minutes(),
                seconds: m.seconds(),
                milliseconds: m.milliseconds(),
            };
        }

        function toJSON() {
            // new Date(NaN).toJSON() === null
            return this.isValid() ? this.toISOString() : null;
        }

        function isValid$2() {
            return isValid(this);
        }

        function parsingFlags() {
            return extend({}, getParsingFlags(this));
        }

        function invalidAt() {
            return getParsingFlags(this).overflow;
        }

        function creationData() {
            return {
                input: this._i,
                format: this._f,
                locale: this._locale,
                isUTC: this._isUTC,
                strict: this._strict,
            };
        }

        addFormatToken('N', 0, 0, 'eraAbbr');
        addFormatToken('NN', 0, 0, 'eraAbbr');
        addFormatToken('NNN', 0, 0, 'eraAbbr');
        addFormatToken('NNNN', 0, 0, 'eraName');
        addFormatToken('NNNNN', 0, 0, 'eraNarrow');

        addFormatToken('y', ['y', 1], 'yo', 'eraYear');
        addFormatToken('y', ['yy', 2], 0, 'eraYear');
        addFormatToken('y', ['yyy', 3], 0, 'eraYear');
        addFormatToken('y', ['yyyy', 4], 0, 'eraYear');

        addRegexToken('N', matchEraAbbr);
        addRegexToken('NN', matchEraAbbr);
        addRegexToken('NNN', matchEraAbbr);
        addRegexToken('NNNN', matchEraName);
        addRegexToken('NNNNN', matchEraNarrow);

        addParseToken(['N', 'NN', 'NNN', 'NNNN', 'NNNNN'], function (
            input,
            array,
            config,
            token
        ) {
            var era = config._locale.erasParse(input, token, config._strict);
            if (era) {
                getParsingFlags(config).era = era;
            } else {
                getParsingFlags(config).invalidEra = input;
            }
        });

        addRegexToken('y', matchUnsigned);
        addRegexToken('yy', matchUnsigned);
        addRegexToken('yyy', matchUnsigned);
        addRegexToken('yyyy', matchUnsigned);
        addRegexToken('yo', matchEraYearOrdinal);

        addParseToken(['y', 'yy', 'yyy', 'yyyy'], YEAR);
        addParseToken(['yo'], function (input, array, config, token) {
            var match;
            if (config._locale._eraYearOrdinalRegex) {
                match = input.match(config._locale._eraYearOrdinalRegex);
            }

            if (config._locale.eraYearOrdinalParse) {
                array[YEAR] = config._locale.eraYearOrdinalParse(input, match);
            } else {
                array[YEAR] = parseInt(input, 10);
            }
        });

        function localeEras(m, format) {
            var i,
                l,
                date,
                eras = this._eras || getLocale('en')._eras;
            for (i = 0, l = eras.length; i < l; ++i) {
                switch (typeof eras[i].since) {
                    case 'string':
                        // truncate time
                        date = hooks(eras[i].since).startOf('day');
                        eras[i].since = date.valueOf();
                        break;
                }

                switch (typeof eras[i].until) {
                    case 'undefined':
                        eras[i].until = +Infinity;
                        break;
                    case 'string':
                        // truncate time
                        date = hooks(eras[i].until).startOf('day').valueOf();
                        eras[i].until = date.valueOf();
                        break;
                }
            }
            return eras;
        }

        function localeErasParse(eraName, format, strict) {
            var i,
                l,
                eras = this.eras(),
                name,
                abbr,
                narrow;
            eraName = eraName.toUpperCase();

            for (i = 0, l = eras.length; i < l; ++i) {
                name = eras[i].name.toUpperCase();
                abbr = eras[i].abbr.toUpperCase();
                narrow = eras[i].narrow.toUpperCase();

                if (strict) {
                    switch (format) {
                        case 'N':
                        case 'NN':
                        case 'NNN':
                            if (abbr === eraName) {
                                return eras[i];
                            }
                            break;

                        case 'NNNN':
                            if (name === eraName) {
                                return eras[i];
                            }
                            break;

                        case 'NNNNN':
                            if (narrow === eraName) {
                                return eras[i];
                            }
                            break;
                    }
                } else if ([name, abbr, narrow].indexOf(eraName) >= 0) {
                    return eras[i];
                }
            }
        }

        function localeErasConvertYear(era, year) {
            var dir = era.since <= era.until ? +1 : -1;
            if (year === undefined) {
                return hooks(era.since).year();
            } else {
                return hooks(era.since).year() + (year - era.offset) * dir;
            }
        }

        function getEraName() {
            var i,
                l,
                val,
                eras = this.localeData().eras();
            for (i = 0, l = eras.length; i < l; ++i) {
                // truncate time
                val = this.clone().startOf('day').valueOf();

                if (eras[i].since <= val && val <= eras[i].until) {
                    return eras[i].name;
                }
                if (eras[i].until <= val && val <= eras[i].since) {
                    return eras[i].name;
                }
            }

            return '';
        }

        function getEraNarrow() {
            var i,
                l,
                val,
                eras = this.localeData().eras();
            for (i = 0, l = eras.length; i < l; ++i) {
                // truncate time
                val = this.clone().startOf('day').valueOf();

                if (eras[i].since <= val && val <= eras[i].until) {
                    return eras[i].narrow;
                }
                if (eras[i].until <= val && val <= eras[i].since) {
                    return eras[i].narrow;
                }
            }

            return '';
        }

        function getEraAbbr() {
            var i,
                l,
                val,
                eras = this.localeData().eras();
            for (i = 0, l = eras.length; i < l; ++i) {
                // truncate time
                val = this.clone().startOf('day').valueOf();

                if (eras[i].since <= val && val <= eras[i].until) {
                    return eras[i].abbr;
                }
                if (eras[i].until <= val && val <= eras[i].since) {
                    return eras[i].abbr;
                }
            }

            return '';
        }

        function getEraYear() {
            var i,
                l,
                dir,
                val,
                eras = this.localeData().eras();
            for (i = 0, l = eras.length; i < l; ++i) {
                dir = eras[i].since <= eras[i].until ? +1 : -1;

                // truncate time
                val = this.clone().startOf('day').valueOf();

                if (
                    (eras[i].since <= val && val <= eras[i].until) ||
                    (eras[i].until <= val && val <= eras[i].since)
                ) {
                    return (
                        (this.year() - hooks(eras[i].since).year()) * dir +
                        eras[i].offset
                    );
                }
            }

            return this.year();
        }

        function erasNameRegex(isStrict) {
            if (!hasOwnProp(this, '_erasNameRegex')) {
                computeErasParse.call(this);
            }
            return isStrict ? this._erasNameRegex : this._erasRegex;
        }

        function erasAbbrRegex(isStrict) {
            if (!hasOwnProp(this, '_erasAbbrRegex')) {
                computeErasParse.call(this);
            }
            return isStrict ? this._erasAbbrRegex : this._erasRegex;
        }

        function erasNarrowRegex(isStrict) {
            if (!hasOwnProp(this, '_erasNarrowRegex')) {
                computeErasParse.call(this);
            }
            return isStrict ? this._erasNarrowRegex : this._erasRegex;
        }

        function matchEraAbbr(isStrict, locale) {
            return locale.erasAbbrRegex(isStrict);
        }

        function matchEraName(isStrict, locale) {
            return locale.erasNameRegex(isStrict);
        }

        function matchEraNarrow(isStrict, locale) {
            return locale.erasNarrowRegex(isStrict);
        }

        function matchEraYearOrdinal(isStrict, locale) {
            return locale._eraYearOrdinalRegex || matchUnsigned;
        }

        function computeErasParse() {
            var abbrPieces = [],
                namePieces = [],
                narrowPieces = [],
                mixedPieces = [],
                i,
                l,
                eras = this.eras();

            for (i = 0, l = eras.length; i < l; ++i) {
                namePieces.push(regexEscape(eras[i].name));
                abbrPieces.push(regexEscape(eras[i].abbr));
                narrowPieces.push(regexEscape(eras[i].narrow));

                mixedPieces.push(regexEscape(eras[i].name));
                mixedPieces.push(regexEscape(eras[i].abbr));
                mixedPieces.push(regexEscape(eras[i].narrow));
            }

            this._erasRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
            this._erasNameRegex = new RegExp('^(' + namePieces.join('|') + ')', 'i');
            this._erasAbbrRegex = new RegExp('^(' + abbrPieces.join('|') + ')', 'i');
            this._erasNarrowRegex = new RegExp(
                '^(' + narrowPieces.join('|') + ')',
                'i'
            );
        }

        // FORMATTING

        addFormatToken(0, ['gg', 2], 0, function () {
            return this.weekYear() % 100;
        });

        addFormatToken(0, ['GG', 2], 0, function () {
            return this.isoWeekYear() % 100;
        });

        function addWeekYearFormatToken(token, getter) {
            addFormatToken(0, [token, token.length], 0, getter);
        }

        addWeekYearFormatToken('gggg', 'weekYear');
        addWeekYearFormatToken('ggggg', 'weekYear');
        addWeekYearFormatToken('GGGG', 'isoWeekYear');
        addWeekYearFormatToken('GGGGG', 'isoWeekYear');

        // ALIASES

        addUnitAlias('weekYear', 'gg');
        addUnitAlias('isoWeekYear', 'GG');

        // PRIORITY

        addUnitPriority('weekYear', 1);
        addUnitPriority('isoWeekYear', 1);

        // PARSING

        addRegexToken('G', matchSigned);
        addRegexToken('g', matchSigned);
        addRegexToken('GG', match1to2, match2);
        addRegexToken('gg', match1to2, match2);
        addRegexToken('GGGG', match1to4, match4);
        addRegexToken('gggg', match1to4, match4);
        addRegexToken('GGGGG', match1to6, match6);
        addRegexToken('ggggg', match1to6, match6);

        addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (
            input,
            week,
            config,
            token
        ) {
            week[token.substr(0, 2)] = toInt(input);
        });

        addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
            week[token] = hooks.parseTwoDigitYear(input);
        });

        // MOMENTS

        function getSetWeekYear(input) {
            return getSetWeekYearHelper.call(
                this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy
            );
        }

        function getSetISOWeekYear(input) {
            return getSetWeekYearHelper.call(
                this,
                input,
                this.isoWeek(),
                this.isoWeekday(),
                1,
                4
            );
        }

        function getISOWeeksInYear() {
            return weeksInYear(this.year(), 1, 4);
        }

        function getISOWeeksInISOWeekYear() {
            return weeksInYear(this.isoWeekYear(), 1, 4);
        }

        function getWeeksInYear() {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        }

        function getWeeksInWeekYear() {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.weekYear(), weekInfo.dow, weekInfo.doy);
        }

        function getSetWeekYearHelper(input, week, weekday, dow, doy) {
            var weeksTarget;
            if (input == null) {
                return weekOfYear(this, dow, doy).year;
            } else {
                weeksTarget = weeksInYear(input, dow, doy);
                if (week > weeksTarget) {
                    week = weeksTarget;
                }
                return setWeekAll.call(this, input, week, weekday, dow, doy);
            }
        }

        function setWeekAll(weekYear, week, weekday, dow, doy) {
            var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
                date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

            this.year(date.getUTCFullYear());
            this.month(date.getUTCMonth());
            this.date(date.getUTCDate());
            return this;
        }

        // FORMATTING

        addFormatToken('Q', 0, 'Qo', 'quarter');

        // ALIASES

        addUnitAlias('quarter', 'Q');

        // PRIORITY

        addUnitPriority('quarter', 7);

        // PARSING

        addRegexToken('Q', match1);
        addParseToken('Q', function (input, array) {
            array[MONTH] = (toInt(input) - 1) * 3;
        });

        // MOMENTS

        function getSetQuarter(input) {
            return input == null
                ? Math.ceil((this.month() + 1) / 3)
                : this.month((input - 1) * 3 + (this.month() % 3));
        }

        // FORMATTING

        addFormatToken('D', ['DD', 2], 'Do', 'date');

        // ALIASES

        addUnitAlias('date', 'D');

        // PRIORITY
        addUnitPriority('date', 9);

        // PARSING

        addRegexToken('D', match1to2);
        addRegexToken('DD', match1to2, match2);
        addRegexToken('Do', function (isStrict, locale) {
            // TODO: Remove "ordinalParse" fallback in next major release.
            return isStrict
                ? locale._dayOfMonthOrdinalParse || locale._ordinalParse
                : locale._dayOfMonthOrdinalParseLenient;
        });

        addParseToken(['D', 'DD'], DATE);
        addParseToken('Do', function (input, array) {
            array[DATE] = toInt(input.match(match1to2)[0]);
        });

        // MOMENTS

        var getSetDayOfMonth = makeGetSet('Date', true);

        // FORMATTING

        addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

        // ALIASES

        addUnitAlias('dayOfYear', 'DDD');

        // PRIORITY
        addUnitPriority('dayOfYear', 4);

        // PARSING

        addRegexToken('DDD', match1to3);
        addRegexToken('DDDD', match3);
        addParseToken(['DDD', 'DDDD'], function (input, array, config) {
            config._dayOfYear = toInt(input);
        });

        // HELPERS

        // MOMENTS

        function getSetDayOfYear(input) {
            var dayOfYear =
                Math.round(
                    (this.clone().startOf('day') - this.clone().startOf('year')) / 864e5
                ) + 1;
            return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
        }

        // FORMATTING

        addFormatToken('m', ['mm', 2], 0, 'minute');

        // ALIASES

        addUnitAlias('minute', 'm');

        // PRIORITY

        addUnitPriority('minute', 14);

        // PARSING

        addRegexToken('m', match1to2);
        addRegexToken('mm', match1to2, match2);
        addParseToken(['m', 'mm'], MINUTE);

        // MOMENTS

        var getSetMinute = makeGetSet('Minutes', false);

        // FORMATTING

        addFormatToken('s', ['ss', 2], 0, 'second');

        // ALIASES

        addUnitAlias('second', 's');

        // PRIORITY

        addUnitPriority('second', 15);

        // PARSING

        addRegexToken('s', match1to2);
        addRegexToken('ss', match1to2, match2);
        addParseToken(['s', 'ss'], SECOND);

        // MOMENTS

        var getSetSecond = makeGetSet('Seconds', false);

        // FORMATTING

        addFormatToken('S', 0, 0, function () {
            return ~~(this.millisecond() / 100);
        });

        addFormatToken(0, ['SS', 2], 0, function () {
            return ~~(this.millisecond() / 10);
        });

        addFormatToken(0, ['SSS', 3], 0, 'millisecond');
        addFormatToken(0, ['SSSS', 4], 0, function () {
            return this.millisecond() * 10;
        });
        addFormatToken(0, ['SSSSS', 5], 0, function () {
            return this.millisecond() * 100;
        });
        addFormatToken(0, ['SSSSSS', 6], 0, function () {
            return this.millisecond() * 1000;
        });
        addFormatToken(0, ['SSSSSSS', 7], 0, function () {
            return this.millisecond() * 10000;
        });
        addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
            return this.millisecond() * 100000;
        });
        addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
            return this.millisecond() * 1000000;
        });

        // ALIASES

        addUnitAlias('millisecond', 'ms');

        // PRIORITY

        addUnitPriority('millisecond', 16);

        // PARSING

        addRegexToken('S', match1to3, match1);
        addRegexToken('SS', match1to3, match2);
        addRegexToken('SSS', match1to3, match3);

        var token, getSetMillisecond;
        for (token = 'SSSS'; token.length <= 9; token += 'S') {
            addRegexToken(token, matchUnsigned);
        }

        function parseMs(input, array) {
            array[MILLISECOND] = toInt(('0.' + input) * 1000);
        }

        for (token = 'S'; token.length <= 9; token += 'S') {
            addParseToken(token, parseMs);
        }

        getSetMillisecond = makeGetSet('Milliseconds', false);

        // FORMATTING

        addFormatToken('z', 0, 0, 'zoneAbbr');
        addFormatToken('zz', 0, 0, 'zoneName');

        // MOMENTS

        function getZoneAbbr() {
            return this._isUTC ? 'UTC' : '';
        }

        function getZoneName() {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        }

        var proto = Moment.prototype;

        proto.add = add;
        proto.calendar = calendar$1;
        proto.clone = clone;
        proto.diff = diff;
        proto.endOf = endOf;
        proto.format = format;
        proto.from = from;
        proto.fromNow = fromNow;
        proto.to = to;
        proto.toNow = toNow;
        proto.get = stringGet;
        proto.invalidAt = invalidAt;
        proto.isAfter = isAfter;
        proto.isBefore = isBefore;
        proto.isBetween = isBetween;
        proto.isSame = isSame;
        proto.isSameOrAfter = isSameOrAfter;
        proto.isSameOrBefore = isSameOrBefore;
        proto.isValid = isValid$2;
        proto.lang = lang;
        proto.locale = locale;
        proto.localeData = localeData;
        proto.max = prototypeMax;
        proto.min = prototypeMin;
        proto.parsingFlags = parsingFlags;
        proto.set = stringSet;
        proto.startOf = startOf;
        proto.subtract = subtract;
        proto.toArray = toArray;
        proto.toObject = toObject;
        proto.toDate = toDate;
        proto.toISOString = toISOString;
        proto.inspect = inspect;
        if (typeof Symbol !== 'undefined' && Symbol.for != null) {
            proto[Symbol.for('nodejs.util.inspect.custom')] = function () {
                return 'Moment<' + this.format() + '>';
            };
        }
        proto.toJSON = toJSON;
        proto.toString = toString;
        proto.unix = unix;
        proto.valueOf = valueOf;
        proto.creationData = creationData;
        proto.eraName = getEraName;
        proto.eraNarrow = getEraNarrow;
        proto.eraAbbr = getEraAbbr;
        proto.eraYear = getEraYear;
        proto.year = getSetYear;
        proto.isLeapYear = getIsLeapYear;
        proto.weekYear = getSetWeekYear;
        proto.isoWeekYear = getSetISOWeekYear;
        proto.quarter = proto.quarters = getSetQuarter;
        proto.month = getSetMonth;
        proto.daysInMonth = getDaysInMonth;
        proto.week = proto.weeks = getSetWeek;
        proto.isoWeek = proto.isoWeeks = getSetISOWeek;
        proto.weeksInYear = getWeeksInYear;
        proto.weeksInWeekYear = getWeeksInWeekYear;
        proto.isoWeeksInYear = getISOWeeksInYear;
        proto.isoWeeksInISOWeekYear = getISOWeeksInISOWeekYear;
        proto.date = getSetDayOfMonth;
        proto.day = proto.days = getSetDayOfWeek;
        proto.weekday = getSetLocaleDayOfWeek;
        proto.isoWeekday = getSetISODayOfWeek;
        proto.dayOfYear = getSetDayOfYear;
        proto.hour = proto.hours = getSetHour;
        proto.minute = proto.minutes = getSetMinute;
        proto.second = proto.seconds = getSetSecond;
        proto.millisecond = proto.milliseconds = getSetMillisecond;
        proto.utcOffset = getSetOffset;
        proto.utc = setOffsetToUTC;
        proto.local = setOffsetToLocal;
        proto.parseZone = setOffsetToParsedOffset;
        proto.hasAlignedHourOffset = hasAlignedHourOffset;
        proto.isDST = isDaylightSavingTime;
        proto.isLocal = isLocal;
        proto.isUtcOffset = isUtcOffset;
        proto.isUtc = isUtc;
        proto.isUTC = isUtc;
        proto.zoneAbbr = getZoneAbbr;
        proto.zoneName = getZoneName;
        proto.dates = deprecate(
            'dates accessor is deprecated. Use date instead.',
            getSetDayOfMonth
        );
        proto.months = deprecate(
            'months accessor is deprecated. Use month instead',
            getSetMonth
        );
        proto.years = deprecate(
            'years accessor is deprecated. Use year instead',
            getSetYear
        );
        proto.zone = deprecate(
            'moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/',
            getSetZone
        );
        proto.isDSTShifted = deprecate(
            'isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information',
            isDaylightSavingTimeShifted
        );

        function createUnix(input) {
            return createLocal(input * 1000);
        }

        function createInZone() {
            return createLocal.apply(null, arguments).parseZone();
        }

        function preParsePostFormat(string) {
            return string;
        }

        var proto$1 = Locale.prototype;

        proto$1.calendar = calendar;
        proto$1.longDateFormat = longDateFormat;
        proto$1.invalidDate = invalidDate;
        proto$1.ordinal = ordinal;
        proto$1.preparse = preParsePostFormat;
        proto$1.postformat = preParsePostFormat;
        proto$1.relativeTime = relativeTime;
        proto$1.pastFuture = pastFuture;
        proto$1.set = set;
        proto$1.eras = localeEras;
        proto$1.erasParse = localeErasParse;
        proto$1.erasConvertYear = localeErasConvertYear;
        proto$1.erasAbbrRegex = erasAbbrRegex;
        proto$1.erasNameRegex = erasNameRegex;
        proto$1.erasNarrowRegex = erasNarrowRegex;

        proto$1.months = localeMonths;
        proto$1.monthsShort = localeMonthsShort;
        proto$1.monthsParse = localeMonthsParse;
        proto$1.monthsRegex = monthsRegex;
        proto$1.monthsShortRegex = monthsShortRegex;
        proto$1.week = localeWeek;
        proto$1.firstDayOfYear = localeFirstDayOfYear;
        proto$1.firstDayOfWeek = localeFirstDayOfWeek;

        proto$1.weekdays = localeWeekdays;
        proto$1.weekdaysMin = localeWeekdaysMin;
        proto$1.weekdaysShort = localeWeekdaysShort;
        proto$1.weekdaysParse = localeWeekdaysParse;

        proto$1.weekdaysRegex = weekdaysRegex;
        proto$1.weekdaysShortRegex = weekdaysShortRegex;
        proto$1.weekdaysMinRegex = weekdaysMinRegex;

        proto$1.isPM = localeIsPM;
        proto$1.meridiem = localeMeridiem;

        function get$1(format, index, field, setter) {
            var locale = getLocale(),
                utc = createUTC().set(setter, index);
            return locale[field](utc, format);
        }

        function listMonthsImpl(format, index, field) {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';

            if (index != null) {
                return get$1(format, index, field, 'month');
            }

            var i,
                out = [];
            for (i = 0; i < 12; i++) {
                out[i] = get$1(format, i, field, 'month');
            }
            return out;
        }

        // ()
        // (5)
        // (fmt, 5)
        // (fmt)
        // (true)
        // (true, 5)
        // (true, fmt, 5)
        // (true, fmt)
        function listWeekdaysImpl(localeSorted, format, index, field) {
            if (typeof localeSorted === 'boolean') {
                if (isNumber(format)) {
                    index = format;
                    format = undefined;
                }

                format = format || '';
            } else {
                format = localeSorted;
                index = format;
                localeSorted = false;

                if (isNumber(format)) {
                    index = format;
                    format = undefined;
                }

                format = format || '';
            }

            var locale = getLocale(),
                shift = localeSorted ? locale._week.dow : 0,
                i,
                out = [];

            if (index != null) {
                return get$1(format, (index + shift) % 7, field, 'day');
            }

            for (i = 0; i < 7; i++) {
                out[i] = get$1(format, (i + shift) % 7, field, 'day');
            }
            return out;
        }

        function listMonths(format, index) {
            return listMonthsImpl(format, index, 'months');
        }

        function listMonthsShort(format, index) {
            return listMonthsImpl(format, index, 'monthsShort');
        }

        function listWeekdays(localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
        }

        function listWeekdaysShort(localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
        }

        function listWeekdaysMin(localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
        }

        getSetGlobalLocale('en', {
            eras: [
                {
                    since: '0001-01-01',
                    until: +Infinity,
                    offset: 1,
                    name: 'Anno Domini',
                    narrow: 'AD',
                    abbr: 'AD',
                },
                {
                    since: '0000-12-31',
                    until: -Infinity,
                    offset: 1,
                    name: 'Before Christ',
                    narrow: 'BC',
                    abbr: 'BC',
                },
            ],
            dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
            ordinal: function (number) {
                var b = number % 10,
                    output =
                        toInt((number % 100) / 10) === 1
                            ? 'th'
                            : b === 1
                            ? 'st'
                            : b === 2
                            ? 'nd'
                            : b === 3
                            ? 'rd'
                            : 'th';
                return number + output;
            },
        });

        // Side effect imports

        hooks.lang = deprecate(
            'moment.lang is deprecated. Use moment.locale instead.',
            getSetGlobalLocale
        );
        hooks.langData = deprecate(
            'moment.langData is deprecated. Use moment.localeData instead.',
            getLocale
        );

        var mathAbs = Math.abs;

        function abs() {
            var data = this._data;

            this._milliseconds = mathAbs(this._milliseconds);
            this._days = mathAbs(this._days);
            this._months = mathAbs(this._months);

            data.milliseconds = mathAbs(data.milliseconds);
            data.seconds = mathAbs(data.seconds);
            data.minutes = mathAbs(data.minutes);
            data.hours = mathAbs(data.hours);
            data.months = mathAbs(data.months);
            data.years = mathAbs(data.years);

            return this;
        }

        function addSubtract$1(duration, input, value, direction) {
            var other = createDuration(input, value);

            duration._milliseconds += direction * other._milliseconds;
            duration._days += direction * other._days;
            duration._months += direction * other._months;

            return duration._bubble();
        }

        // supports only 2.0-style add(1, 's') or add(duration)
        function add$1(input, value) {
            return addSubtract$1(this, input, value, 1);
        }

        // supports only 2.0-style subtract(1, 's') or subtract(duration)
        function subtract$1(input, value) {
            return addSubtract$1(this, input, value, -1);
        }

        function absCeil(number) {
            if (number < 0) {
                return Math.floor(number);
            } else {
                return Math.ceil(number);
            }
        }

        function bubble() {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds,
                minutes,
                hours,
                years,
                monthsFromDays;

            // if we have a mix of positive and negative values, bubble down first
            // check: https://github.com/moment/moment/issues/2166
            if (
                !(
                    (milliseconds >= 0 && days >= 0 && months >= 0) ||
                    (milliseconds <= 0 && days <= 0 && months <= 0)
                )
            ) {
                milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
                days = 0;
                months = 0;
            }

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absFloor(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absFloor(seconds / 60);
            data.minutes = minutes % 60;

            hours = absFloor(minutes / 60);
            data.hours = hours % 24;

            days += absFloor(hours / 24);

            // convert days to months
            monthsFromDays = absFloor(daysToMonths(days));
            months += monthsFromDays;
            days -= absCeil(monthsToDays(monthsFromDays));

            // 12 months -> 1 year
            years = absFloor(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;

            return this;
        }

        function daysToMonths(days) {
            // 400 years have 146097 days (taking into account leap year rules)
            // 400 years have 12 months === 4800
            return (days * 4800) / 146097;
        }

        function monthsToDays(months) {
            // the reverse of daysToMonths
            return (months * 146097) / 4800;
        }

        function as(units) {
            if (!this.isValid()) {
                return NaN;
            }
            var days,
                months,
                milliseconds = this._milliseconds;

            units = normalizeUnits(units);

            if (units === 'month' || units === 'quarter' || units === 'year') {
                days = this._days + milliseconds / 864e5;
                months = this._months + daysToMonths(days);
                switch (units) {
                    case 'month':
                        return months;
                    case 'quarter':
                        return months / 3;
                    case 'year':
                        return months / 12;
                }
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + Math.round(monthsToDays(this._months));
                switch (units) {
                    case 'week':
                        return days / 7 + milliseconds / 6048e5;
                    case 'day':
                        return days + milliseconds / 864e5;
                    case 'hour':
                        return days * 24 + milliseconds / 36e5;
                    case 'minute':
                        return days * 1440 + milliseconds / 6e4;
                    case 'second':
                        return days * 86400 + milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond':
                        return Math.floor(days * 864e5) + milliseconds;
                    default:
                        throw new Error('Unknown unit ' + units);
                }
            }
        }

        // TODO: Use this.as('ms')?
        function valueOf$1() {
            if (!this.isValid()) {
                return NaN;
            }
            return (
                this._milliseconds +
                this._days * 864e5 +
                (this._months % 12) * 2592e6 +
                toInt(this._months / 12) * 31536e6
            );
        }

        function makeAs(alias) {
            return function () {
                return this.as(alias);
            };
        }

        var asMilliseconds = makeAs('ms'),
            asSeconds = makeAs('s'),
            asMinutes = makeAs('m'),
            asHours = makeAs('h'),
            asDays = makeAs('d'),
            asWeeks = makeAs('w'),
            asMonths = makeAs('M'),
            asQuarters = makeAs('Q'),
            asYears = makeAs('y');

        function clone$1() {
            return createDuration(this);
        }

        function get$2(units) {
            units = normalizeUnits(units);
            return this.isValid() ? this[units + 's']() : NaN;
        }

        function makeGetter(name) {
            return function () {
                return this.isValid() ? this._data[name] : NaN;
            };
        }

        var milliseconds = makeGetter('milliseconds'),
            seconds = makeGetter('seconds'),
            minutes = makeGetter('minutes'),
            hours = makeGetter('hours'),
            days = makeGetter('days'),
            months = makeGetter('months'),
            years = makeGetter('years');

        function weeks() {
            return absFloor(this.days() / 7);
        }

        var round = Math.round,
            thresholds = {
                ss: 44, // a few seconds to seconds
                s: 45, // seconds to minute
                m: 45, // minutes to hour
                h: 22, // hours to day
                d: 26, // days to month/week
                w: null, // weeks to month
                M: 11, // months to year
            };

        // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
        function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
            return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
        }

        function relativeTime$1(posNegDuration, withoutSuffix, thresholds, locale) {
            var duration = createDuration(posNegDuration).abs(),
                seconds = round(duration.as('s')),
                minutes = round(duration.as('m')),
                hours = round(duration.as('h')),
                days = round(duration.as('d')),
                months = round(duration.as('M')),
                weeks = round(duration.as('w')),
                years = round(duration.as('y')),
                a =
                    (seconds <= thresholds.ss && ['s', seconds]) ||
                    (seconds < thresholds.s && ['ss', seconds]) ||
                    (minutes <= 1 && ['m']) ||
                    (minutes < thresholds.m && ['mm', minutes]) ||
                    (hours <= 1 && ['h']) ||
                    (hours < thresholds.h && ['hh', hours]) ||
                    (days <= 1 && ['d']) ||
                    (days < thresholds.d && ['dd', days]);

            if (thresholds.w != null) {
                a =
                    a ||
                    (weeks <= 1 && ['w']) ||
                    (weeks < thresholds.w && ['ww', weeks]);
            }
            a = a ||
                (months <= 1 && ['M']) ||
                (months < thresholds.M && ['MM', months]) ||
                (years <= 1 && ['y']) || ['yy', years];

            a[2] = withoutSuffix;
            a[3] = +posNegDuration > 0;
            a[4] = locale;
            return substituteTimeAgo.apply(null, a);
        }

        // This function allows you to set the rounding function for relative time strings
        function getSetRelativeTimeRounding(roundingFunction) {
            if (roundingFunction === undefined) {
                return round;
            }
            if (typeof roundingFunction === 'function') {
                round = roundingFunction;
                return true;
            }
            return false;
        }

        // This function allows you to set a threshold for relative time strings
        function getSetRelativeTimeThreshold(threshold, limit) {
            if (thresholds[threshold] === undefined) {
                return false;
            }
            if (limit === undefined) {
                return thresholds[threshold];
            }
            thresholds[threshold] = limit;
            if (threshold === 's') {
                thresholds.ss = limit - 1;
            }
            return true;
        }

        function humanize(argWithSuffix, argThresholds) {
            if (!this.isValid()) {
                return this.localeData().invalidDate();
            }

            var withSuffix = false,
                th = thresholds,
                locale,
                output;

            if (typeof argWithSuffix === 'object') {
                argThresholds = argWithSuffix;
                argWithSuffix = false;
            }
            if (typeof argWithSuffix === 'boolean') {
                withSuffix = argWithSuffix;
            }
            if (typeof argThresholds === 'object') {
                th = Object.assign({}, thresholds, argThresholds);
                if (argThresholds.s != null && argThresholds.ss == null) {
                    th.ss = argThresholds.s - 1;
                }
            }

            locale = this.localeData();
            output = relativeTime$1(this, !withSuffix, th, locale);

            if (withSuffix) {
                output = locale.pastFuture(+this, output);
            }

            return locale.postformat(output);
        }

        var abs$1 = Math.abs;

        function sign(x) {
            return (x > 0) - (x < 0) || +x;
        }

        function toISOString$1() {
            // for ISO strings we do not use the normal bubbling rules:
            //  * milliseconds bubble up until they become hours
            //  * days do not bubble at all
            //  * months bubble up until they become years
            // This is because there is no context-free conversion between hours and days
            // (think of clock changes)
            // and also not between days and months (28-31 days per month)
            if (!this.isValid()) {
                return this.localeData().invalidDate();
            }

            var seconds = abs$1(this._milliseconds) / 1000,
                days = abs$1(this._days),
                months = abs$1(this._months),
                minutes,
                hours,
                years,
                s,
                total = this.asSeconds(),
                totalSign,
                ymSign,
                daysSign,
                hmsSign;

            if (!total) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            // 3600 seconds -> 60 minutes -> 1 hour
            minutes = absFloor(seconds / 60);
            hours = absFloor(minutes / 60);
            seconds %= 60;
            minutes %= 60;

            // 12 months -> 1 year
            years = absFloor(months / 12);
            months %= 12;

            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';

            totalSign = total < 0 ? '-' : '';
            ymSign = sign(this._months) !== sign(total) ? '-' : '';
            daysSign = sign(this._days) !== sign(total) ? '-' : '';
            hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

            return (
                totalSign +
                'P' +
                (years ? ymSign + years + 'Y' : '') +
                (months ? ymSign + months + 'M' : '') +
                (days ? daysSign + days + 'D' : '') +
                (hours || minutes || seconds ? 'T' : '') +
                (hours ? hmsSign + hours + 'H' : '') +
                (minutes ? hmsSign + minutes + 'M' : '') +
                (seconds ? hmsSign + s + 'S' : '')
            );
        }

        var proto$2 = Duration.prototype;

        proto$2.isValid = isValid$1;
        proto$2.abs = abs;
        proto$2.add = add$1;
        proto$2.subtract = subtract$1;
        proto$2.as = as;
        proto$2.asMilliseconds = asMilliseconds;
        proto$2.asSeconds = asSeconds;
        proto$2.asMinutes = asMinutes;
        proto$2.asHours = asHours;
        proto$2.asDays = asDays;
        proto$2.asWeeks = asWeeks;
        proto$2.asMonths = asMonths;
        proto$2.asQuarters = asQuarters;
        proto$2.asYears = asYears;
        proto$2.valueOf = valueOf$1;
        proto$2._bubble = bubble;
        proto$2.clone = clone$1;
        proto$2.get = get$2;
        proto$2.milliseconds = milliseconds;
        proto$2.seconds = seconds;
        proto$2.minutes = minutes;
        proto$2.hours = hours;
        proto$2.days = days;
        proto$2.weeks = weeks;
        proto$2.months = months;
        proto$2.years = years;
        proto$2.humanize = humanize;
        proto$2.toISOString = toISOString$1;
        proto$2.toString = toISOString$1;
        proto$2.toJSON = toISOString$1;
        proto$2.locale = locale;
        proto$2.localeData = localeData;

        proto$2.toIsoString = deprecate(
            'toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)',
            toISOString$1
        );
        proto$2.lang = lang;

        // FORMATTING

        addFormatToken('X', 0, 0, 'unix');
        addFormatToken('x', 0, 0, 'valueOf');

        // PARSING

        addRegexToken('x', matchSigned);
        addRegexToken('X', matchTimestamp);
        addParseToken('X', function (input, array, config) {
            config._d = new Date(parseFloat(input) * 1000);
        });
        addParseToken('x', function (input, array, config) {
            config._d = new Date(toInt(input));
        });

        //! moment.js

        hooks.version = '2.29.1';

        setHookCallback(createLocal);

        hooks.fn = proto;
        hooks.min = min;
        hooks.max = max;
        hooks.now = now;
        hooks.utc = createUTC;
        hooks.unix = createUnix;
        hooks.months = listMonths;
        hooks.isDate = isDate;
        hooks.locale = getSetGlobalLocale;
        hooks.invalid = createInvalid;
        hooks.duration = createDuration;
        hooks.isMoment = isMoment;
        hooks.weekdays = listWeekdays;
        hooks.parseZone = createInZone;
        hooks.localeData = getLocale;
        hooks.isDuration = isDuration;
        hooks.monthsShort = listMonthsShort;
        hooks.weekdaysMin = listWeekdaysMin;
        hooks.defineLocale = defineLocale;
        hooks.updateLocale = updateLocale;
        hooks.locales = listLocales;
        hooks.weekdaysShort = listWeekdaysShort;
        hooks.normalizeUnits = normalizeUnits;
        hooks.relativeTimeRounding = getSetRelativeTimeRounding;
        hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
        hooks.calendarFormat = getCalendarFormat;
        hooks.prototype = proto;

        // currently HTML5 input type only supports 24-hour formats
        hooks.HTML5_FMT = {
            DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm', // <input type="datetime-local" />
            DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss', // <input type="datetime-local" step="1" />
            DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS', // <input type="datetime-local" step="0.001" />
            DATE: 'YYYY-MM-DD', // <input type="date" />
            TIME: 'HH:mm', // <input type="time" />
            TIME_SECONDS: 'HH:mm:ss', // <input type="time" step="1" />
            TIME_MS: 'HH:mm:ss.SSS', // <input type="time" step="0.001" />
            WEEK: 'GGGG-[W]WW', // <input type="week" />
            MONTH: 'YYYY-MM', // <input type="month" />
        };

        return hooks;

    })));
    });

    createCommonjsModule(function (module, exports) {
    (function (global, factory) {
       typeof commonjsRequire === 'function' ? factory(moment) :
       factory(global.moment);
    }(commonjsGlobal, (function (moment) {
        //! moment.js locale configuration

        function plural(word, num) {
            var forms = word.split('_');
            return num % 10 === 1 && num % 100 !== 11
                ? forms[0]
                : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20)
                ? forms[1]
                : forms[2];
        }
        function relativeTimeWithPlural(number, withoutSuffix, key) {
            var format = {
                ss: withoutSuffix ? 'секунда_секунды_секунд' : 'секунду_секунды_секунд',
                mm: withoutSuffix ? 'минута_минуты_минут' : 'минуту_минуты_минут',
                hh: 'час_часа_часов',
                dd: 'день_дня_дней',
                ww: 'неделя_недели_недель',
                MM: 'месяц_месяца_месяцев',
                yy: 'год_года_лет',
            };
            if (key === 'm') {
                return withoutSuffix ? 'минута' : 'минуту';
            } else {
                return number + ' ' + plural(format[key], +number);
            }
        }
        var monthsParse = [
            /^янв/i,
            /^фев/i,
            /^мар/i,
            /^апр/i,
            /^ма[йя]/i,
            /^июн/i,
            /^июл/i,
            /^авг/i,
            /^сен/i,
            /^окт/i,
            /^ноя/i,
            /^дек/i,
        ];

        // http://new.gramota.ru/spravka/rules/139-prop : § 103
        // Сокращения месяцев: http://new.gramota.ru/spravka/buro/search-answer?s=242637
        // CLDR data:          http://www.unicode.org/cldr/charts/28/summary/ru.html#1753
        var ru = moment.defineLocale('ru', {
            months: {
                format: 'января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря'.split(
                    '_'
                ),
                standalone: 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split(
                    '_'
                ),
            },
            monthsShort: {
                // по CLDR именно "июл." и "июн.", но какой смысл менять букву на точку?
                format: 'янв._февр._мар._апр._мая_июня_июля_авг._сент._окт._нояб._дек.'.split(
                    '_'
                ),
                standalone: 'янв._февр._март_апр._май_июнь_июль_авг._сент._окт._нояб._дек.'.split(
                    '_'
                ),
            },
            weekdays: {
                standalone: 'воскресенье_понедельник_вторник_среда_четверг_пятница_суббота'.split(
                    '_'
                ),
                format: 'воскресенье_понедельник_вторник_среду_четверг_пятницу_субботу'.split(
                    '_'
                ),
                isFormat: /\[ ?[Вв] ?(?:прошлую|следующую|эту)? ?] ?dddd/,
            },
            weekdaysShort: 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
            weekdaysMin: 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
            monthsParse: monthsParse,
            longMonthsParse: monthsParse,
            shortMonthsParse: monthsParse,

            // полные названия с падежами, по три буквы, для некоторых, по 4 буквы, сокращения с точкой и без точки
            monthsRegex: /^(январ[ья]|янв\.?|феврал[ья]|февр?\.?|марта?|мар\.?|апрел[ья]|апр\.?|ма[йя]|июн[ья]|июн\.?|июл[ья]|июл\.?|августа?|авг\.?|сентябр[ья]|сент?\.?|октябр[ья]|окт\.?|ноябр[ья]|нояб?\.?|декабр[ья]|дек\.?)/i,

            // копия предыдущего
            monthsShortRegex: /^(январ[ья]|янв\.?|феврал[ья]|февр?\.?|марта?|мар\.?|апрел[ья]|апр\.?|ма[йя]|июн[ья]|июн\.?|июл[ья]|июл\.?|августа?|авг\.?|сентябр[ья]|сент?\.?|октябр[ья]|окт\.?|ноябр[ья]|нояб?\.?|декабр[ья]|дек\.?)/i,

            // полные названия с падежами
            monthsStrictRegex: /^(январ[яь]|феврал[яь]|марта?|апрел[яь]|ма[яй]|июн[яь]|июл[яь]|августа?|сентябр[яь]|октябр[яь]|ноябр[яь]|декабр[яь])/i,

            // Выражение, которое соответствует только сокращённым формам
            monthsShortStrictRegex: /^(янв\.|февр?\.|мар[т.]|апр\.|ма[яй]|июн[ья.]|июл[ья.]|авг\.|сент?\.|окт\.|нояб?\.|дек\.)/i,
            longDateFormat: {
                LT: 'H:mm',
                LTS: 'H:mm:ss',
                L: 'DD.MM.YYYY',
                LL: 'D MMMM YYYY г.',
                LLL: 'D MMMM YYYY г., H:mm',
                LLLL: 'dddd, D MMMM YYYY г., H:mm',
            },
            calendar: {
                sameDay: '[Сегодня, в] LT',
                nextDay: '[Завтра, в] LT',
                lastDay: '[Вчера, в] LT',
                nextWeek: function (now) {
                    if (now.week() !== this.week()) {
                        switch (this.day()) {
                            case 0:
                                return '[В следующее] dddd, [в] LT';
                            case 1:
                            case 2:
                            case 4:
                                return '[В следующий] dddd, [в] LT';
                            case 3:
                            case 5:
                            case 6:
                                return '[В следующую] dddd, [в] LT';
                        }
                    } else {
                        if (this.day() === 2) {
                            return '[Во] dddd, [в] LT';
                        } else {
                            return '[В] dddd, [в] LT';
                        }
                    }
                },
                lastWeek: function (now) {
                    if (now.week() !== this.week()) {
                        switch (this.day()) {
                            case 0:
                                return '[В прошлое] dddd, [в] LT';
                            case 1:
                            case 2:
                            case 4:
                                return '[В прошлый] dddd, [в] LT';
                            case 3:
                            case 5:
                            case 6:
                                return '[В прошлую] dddd, [в] LT';
                        }
                    } else {
                        if (this.day() === 2) {
                            return '[Во] dddd, [в] LT';
                        } else {
                            return '[В] dddd, [в] LT';
                        }
                    }
                },
                sameElse: 'L',
            },
            relativeTime: {
                future: 'через %s',
                past: '%s назад',
                s: 'несколько секунд',
                ss: relativeTimeWithPlural,
                m: relativeTimeWithPlural,
                mm: relativeTimeWithPlural,
                h: 'час',
                hh: relativeTimeWithPlural,
                d: 'день',
                dd: relativeTimeWithPlural,
                w: 'неделя',
                ww: relativeTimeWithPlural,
                M: 'месяц',
                MM: relativeTimeWithPlural,
                y: 'год',
                yy: relativeTimeWithPlural,
            },
            meridiemParse: /ночи|утра|дня|вечера/i,
            isPM: function (input) {
                return /^(дня|вечера)$/.test(input);
            },
            meridiem: function (hour, minute, isLower) {
                if (hour < 4) {
                    return 'ночи';
                } else if (hour < 12) {
                    return 'утра';
                } else if (hour < 17) {
                    return 'дня';
                } else {
                    return 'вечера';
                }
            },
            dayOfMonthOrdinalParse: /\d{1,2}-(й|го|я)/,
            ordinal: function (number, period) {
                switch (period) {
                    case 'M':
                    case 'd':
                    case 'DDD':
                        return number + '-й';
                    case 'D':
                        return number + '-го';
                    case 'w':
                    case 'W':
                        return number + '-я';
                    default:
                        return number;
                }
            },
            week: {
                dow: 1, // Monday is the first day of the week.
                doy: 4, // The week that contains Jan 4th is the first week of the year.
            },
        });

        return ru;

    })));
    });

    /* src\components\elements\NewsDate.svelte generated by Svelte v3.43.2 */
    const file$5 = "src\\components\\elements\\NewsDate.svelte";

    function create_fragment$6(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*momentDate*/ ctx[0]);
    			attr_dev(span, "class", "date svelte-1vw5mkn");
    			attr_dev(span, "title", /*currentDate*/ ctx[1]);
    			add_location(span, file$5, 39, 0, 905);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*momentDate*/ 1) set_data_dev(t, /*momentDate*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NewsDate', slots, []);
    	let { postDate } = $$props;
    	let currentPostDate = new Date(postDate);
    	let momentDate = "";

    	const monthNames = [
    		"января",
    		"февраля",
    		"марта",
    		"апреля",
    		"мая",
    		"июня",
    		"июля",
    		"августа",
    		"сентября",
    		"октября",
    		"ноября",
    		"декабря"
    	];

    	const day = currentPostDate.getDate();
    	const month = currentPostDate.getMonth();
    	const year = currentPostDate.getFullYear();
    	const hours = currentPostDate.getHours();
    	const minutes = currentPostDate.getMinutes();
    	let currentDate = `${day} ${monthNames[month]} ${year} в ${hours}:${minutes}`;

    	const getCurrentDate = currentPostDate => {
    		return $$invalidate(0, momentDate = moment(currentPostDate).startOf("hour").fromNow());
    	};

    	getCurrentDate(currentPostDate);
    	const writable_props = ['postDate'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NewsDate> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('postDate' in $$props) $$invalidate(2, postDate = $$props.postDate);
    	};

    	$$self.$capture_state = () => ({
    		moment,
    		postDate,
    		currentPostDate,
    		momentDate,
    		monthNames,
    		day,
    		month,
    		year,
    		hours,
    		minutes,
    		currentDate,
    		getCurrentDate
    	});

    	$$self.$inject_state = $$props => {
    		if ('postDate' in $$props) $$invalidate(2, postDate = $$props.postDate);
    		if ('currentPostDate' in $$props) currentPostDate = $$props.currentPostDate;
    		if ('momentDate' in $$props) $$invalidate(0, momentDate = $$props.momentDate);
    		if ('currentDate' in $$props) $$invalidate(1, currentDate = $$props.currentDate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [momentDate, currentDate, postDate];
    }

    class NewsDate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { postDate: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NewsDate",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*postDate*/ ctx[2] === undefined && !('postDate' in props)) {
    			console.warn("<NewsDate> was created without expected prop 'postDate'");
    		}
    	}

    	get postDate() {
    		throw new Error("<NewsDate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set postDate(value) {
    		throw new Error("<NewsDate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\News.svelte generated by Svelte v3.43.2 */
    const file$4 = "src\\components\\News.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (34:8) 
    function create_title_slot$3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = `${/*sectionTitle*/ ctx[1]}`;
    			attr_dev(span, "slot", "title");
    			add_location(span, file$4, 33, 8, 1196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot$3.name,
    		type: "slot",
    		source: "(34:8) ",
    		ctx
    	});

    	return block;
    }

    // (38:8) {#each news as post}
    function create_each_block$1(ctx) {
    	let article;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let newsdate;
    	let t1;
    	let div2;
    	let h4;
    	let a0;
    	let t2_value = /*post*/ ctx[3].title + "";
    	let t2;
    	let t3;
    	let p;
    	let t4_value = /*post*/ ctx[3].descr + "";
    	let t4;
    	let t5;
    	let a1;
    	let t7;
    	let current;

    	newsdate = new NewsDate({
    			props: { postDate: /*post*/ ctx[3].date },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			article = element("article");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			create_component(newsdate.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			h4 = element("h4");
    			a0 = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			a1 = element("a");
    			a1.textContent = "Читать далее";
    			t7 = space();
    			if (!src_url_equal(img.src, img_src_value = /*post*/ ctx[3].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*post*/ ctx[3].title);
    			attr_dev(img, "class", "svelte-1c3u35o");
    			add_location(img, file$4, 40, 14, 1415);
    			attr_dev(div0, "class", "news-img svelte-1c3u35o");
    			add_location(div0, file$4, 39, 12, 1377);
    			attr_dev(div1, "class", "meta svelte-1c3u35o");
    			add_location(div1, file$4, 42, 12, 1488);
    			attr_dev(a0, "class", "news-title svelte-1c3u35o");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$4, 46, 18, 1635);
    			add_location(h4, file$4, 46, 14, 1631);
    			attr_dev(p, "class", "news-descr svelte-1c3u35o");
    			add_location(p, file$4, 47, 14, 1703);
    			attr_dev(a1, "class", "more-link");
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$4, 48, 14, 1757);
    			attr_dev(div2, "class", "news-content svelte-1c3u35o");
    			add_location(div2, file$4, 45, 12, 1589);
    			attr_dev(article, "class", "news-box svelte-1c3u35o");
    			add_location(article, file$4, 38, 10, 1337);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div0);
    			append_dev(div0, img);
    			append_dev(article, t0);
    			append_dev(article, div1);
    			mount_component(newsdate, div1, null);
    			append_dev(article, t1);
    			append_dev(article, div2);
    			append_dev(div2, h4);
    			append_dev(h4, a0);
    			append_dev(a0, t2);
    			append_dev(div2, t3);
    			append_dev(div2, p);
    			append_dev(p, t4);
    			append_dev(div2, t5);
    			append_dev(div2, a1);
    			append_dev(article, t7);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(newsdate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(newsdate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_component(newsdate);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(38:8) {#each news as post}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let section;
    	let div2;
    	let div1;
    	let sectionheading;
    	let t;
    	let div0;
    	let current;

    	sectionheading = new SectionHeading({
    			props: {
    				$$slots: { title: [create_title_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = /*news*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			create_component(sectionheading.$$.fragment);
    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "news-block svelte-1c3u35o");
    			add_location(div0, file$4, 36, 6, 1271);
    			attr_dev(div1, "class", "content svelte-1c3u35o");
    			add_location(div1, file$4, 31, 4, 1141);
    			attr_dev(div2, "class", "wrapper");
    			add_location(div2, file$4, 30, 2, 1114);
    			attr_dev(section, "class", "section news svelte-1c3u35o");
    			attr_dev(section, "id", "newsBlog");
    			set_style(section, "background-image", "url(" + /*bgUrl*/ ctx[0] + ")");
    			add_location(section, file$4, 25, 0, 1016);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			mount_component(sectionheading, div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sectionheading_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				sectionheading_changes.$$scope = { dirty, ctx };
    			}

    			sectionheading.$set(sectionheading_changes);

    			if (dirty & /*news*/ 4) {
    				each_value = /*news*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
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
    			transition_in(sectionheading.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheading.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(sectionheading);
    			destroy_each(each_blocks, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('News', slots, []);
    	let bgUrl = "../content/News/bg.jpg";
    	let sectionTitle = "Новостной блог";

    	let news = [
    		{
    			title: "Долгая дарит горнолыжникам ски-пасс",
    			date: "2021-11-01T21:40:00",
    			descr: "В эту пятницу, 3 декабря, на Долгой будет дан старт специальной акции для горнолыжников и сноубордистов – «Ски-пасс в подарок». Она продлится до 29 декабря включительно и повторится в конце сезона – с 1 по 29 марта 2022.",
    			img: "../content/News/news-1.jpg"
    		},
    		{
    			title: "Открытие горнолыжного сезона 2021",
    			date: "2021-10-20T14:12:00",
    			descr: "В преддверии главной премьеры нового сезона мы начинаем открывать тестовое катание по ограниченному количеству трасс, которые пригодны для катания в самом начале сезона. Официальное открытие состоится 9 декабря.",
    			img: "../content/News/news-2.jpg"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<News> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		SectionHeading,
    		NewsDate,
    		bgUrl,
    		sectionTitle,
    		news
    	});

    	$$self.$inject_state = $$props => {
    		if ('bgUrl' in $$props) $$invalidate(0, bgUrl = $$props.bgUrl);
    		if ('sectionTitle' in $$props) $$invalidate(1, sectionTitle = $$props.sectionTitle);
    		if ('news' in $$props) $$invalidate(2, news = $$props.news);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bgUrl, sectionTitle, news];
    }

    class News extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "News",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\Services.svelte generated by Svelte v3.43.2 */
    const file$3 = "src\\components\\Services.svelte";

    // (12:8) 
    function create_title_slot$2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = `${/*sectionTitle*/ ctx[1]}`;
    			attr_dev(span, "slot", "title");
    			add_location(span, file$3, 11, 8, 359);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot$2.name,
    		type: "slot",
    		source: "(12:8) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let div2;
    	let div1;
    	let sectionheading;
    	let t0;
    	let div0;
    	let p0;
    	let t2;
    	let p1;
    	let t4;
    	let p2;
    	let t6;
    	let p3;
    	let t8;
    	let ul;
    	let li0;
    	let a0;
    	let svg0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let t9;
    	let span0;
    	let t11;
    	let li1;
    	let a1;
    	let svg1;
    	let path4;
    	let t12;
    	let span1;
    	let t14;
    	let li2;
    	let a2;
    	let svg2;
    	let path5;
    	let t15;
    	let span2;
    	let current;

    	sectionheading = new SectionHeading({
    			props: {
    				$$slots: { title: [create_title_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			create_component(sectionheading.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Горнолыжный курорт гора Долгая предлагает своим гостям прокат\r\n          горнолыжного оборудования и экипировки, катание на тюбингах, услуги\r\n          инструкторов. Круглогодично функционируют стрелковый стенд,\r\n          пейнтбольное стрельбище, бильярдная комната и боулинг. По будням\r\n          открыт вход в тренажерный зал.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "В летнее время года на территории комплекса открываются спортивные\r\n          площадки с почасовой арендой и подъемник для велосипедистов, желающих\r\n          проверить себя в маунтибайке.";
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "Отдохнуть и перекусить после активно проведенного дня можно в уютном\r\n          кафе «У камина» или в столовой, находящейся в гостинице.";
    			t6 = space();
    			p3 = element("p");
    			p3.textContent = "Кроме этого гостям предлагаются беседки с мангалом, где можно устроить\r\n          пикник или весело провести время с близкими людьми.";
    			t8 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			t9 = space();
    			span0 = element("span");
    			span0.textContent = "Все услуги";
    			t11 = space();
    			li1 = element("li");
    			a1 = element("a");
    			svg1 = svg_element("svg");
    			path4 = svg_element("path");
    			t12 = space();
    			span1 = element("span");
    			span1.textContent = "Цены";
    			t14 = space();
    			li2 = element("li");
    			a2 = element("a");
    			svg2 = svg_element("svg");
    			path5 = svg_element("path");
    			t15 = space();
    			span2 = element("span");
    			span2.textContent = "Подарочные сертификаты";
    			attr_dev(p0, "class", "svelte-j0uakj");
    			add_location(p0, file$3, 15, 8, 468);
    			attr_dev(p1, "class", "svelte-j0uakj");
    			add_location(p1, file$3, 22, 8, 836);
    			attr_dev(p2, "class", "svelte-j0uakj");
    			add_location(p2, file$3, 27, 8, 1063);
    			attr_dev(p3, "class", "svelte-j0uakj");
    			add_location(p3, file$3, 31, 8, 1238);
    			attr_dev(div0, "class", "text-block svelte-j0uakj");
    			add_location(div0, file$3, 14, 6, 434);
    			attr_dev(path0, "d", "M24 33C24 30.2044 24 28.8065 24.4567 27.7039C25.0657 26.2337 26.2337 25.0657 27.7039 24.4567C28.8065 24 30.2044 24 33 24C35.7956 24 37.1935 24 38.2961 24.4567C39.7663 25.0657 40.9343 26.2337 41.5433 27.7039C42 28.8065 42 30.2044 42 33C42 35.7956 42 37.1935 41.5433 38.2961C40.9343 39.7663 39.7663 40.9343 38.2961 41.5433C37.1935 42 35.7956 42 33 42C30.2044 42 28.8065 42 27.7039 41.5433C26.2337 40.9343 25.0657 39.7663 24.4567 38.2961C24 37.1935 24 35.7956 24 33Z");
    			attr_dev(path0, "stroke", "#DD4141");
    			attr_dev(path0, "stroke-width", "2.5");
    			add_location(path0, file$3, 48, 14, 1761);
    			attr_dev(path1, "d", "M54 33C54 30.2044 54 28.8065 54.4567 27.7039C55.0657 26.2337 56.2337 25.0657 57.7039 24.4567C58.8065 24 60.2044 24 63 24C65.7956 24 67.1935 24 68.2961 24.4567C69.7663 25.0657 70.9343 26.2337 71.5433 27.7039C72 28.8065 72 30.2044 72 33C72 35.7956 72 37.1935 71.5433 38.2961C70.9343 39.7663 69.7663 40.9343 68.2961 41.5433C67.1935 42 65.7956 42 63 42C60.2044 42 58.8065 42 57.7039 41.5433C56.2337 40.9343 55.0657 39.7663 54.4567 38.2961C54 37.1935 54 35.7956 54 33Z");
    			attr_dev(path1, "stroke", "#DD4141");
    			attr_dev(path1, "stroke-width", "2.5");
    			add_location(path1, file$3, 53, 14, 2355);
    			attr_dev(path2, "d", "M24 63C24 60.2044 24 58.8065 24.4567 57.7039C25.0657 56.2337 26.2337 55.0657 27.7039 54.4567C28.8065 54 30.2044 54 33 54C35.7956 54 37.1935 54 38.2961 54.4567C39.7663 55.0657 40.9343 56.2337 41.5433 57.7039C42 58.8065 42 60.2044 42 63C42 65.7956 42 67.1935 41.5433 68.2961C40.9343 69.7663 39.7663 70.9343 38.2961 71.5433C37.1935 72 35.7956 72 33 72C30.2044 72 28.8065 72 27.7039 71.5433C26.2337 70.9343 25.0657 69.7663 24.4567 68.2961C24 67.1935 24 65.7956 24 63Z");
    			attr_dev(path2, "stroke", "#DD4141");
    			attr_dev(path2, "stroke-width", "2.5");
    			add_location(path2, file$3, 58, 14, 2949);
    			attr_dev(path3, "d", "M54 63C54 60.2044 54 58.8065 54.4567 57.7039C55.0657 56.2337 56.2337 55.0657 57.7039 54.4567C58.8065 54 60.2044 54 63 54C65.7956 54 67.1935 54 68.2961 54.4567C69.7663 55.0657 70.9343 56.2337 71.5433 57.7039C72 58.8065 72 60.2044 72 63C72 65.7956 72 67.1935 71.5433 68.2961C70.9343 69.7663 69.7663 70.9343 68.2961 71.5433C67.1935 72 65.7956 72 63 72C60.2044 72 58.8065 72 57.7039 71.5433C56.2337 70.9343 55.0657 69.7663 54.4567 68.2961C54 67.1935 54 65.7956 54 63Z");
    			attr_dev(path3, "stroke", "#DD4141");
    			attr_dev(path3, "stroke-width", "2.5");
    			add_location(path3, file$3, 63, 14, 3543);
    			attr_dev(svg0, "class", "icon icon-services svelte-j0uakj");
    			attr_dev(svg0, "width", "96");
    			attr_dev(svg0, "height", "96");
    			attr_dev(svg0, "viewBox", "0 0 96 96");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$3, 40, 12, 1519);
    			attr_dev(span0, "class", "title svelte-j0uakj");
    			add_location(span0, file$3, 69, 12, 4155);
    			attr_dev(a0, "class", "link svelte-j0uakj");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$3, 39, 10, 1480);
    			attr_dev(li0, "class", "item svelte-j0uakj");
    			add_location(li0, file$3, 38, 8, 1451);
    			attr_dev(path4, "d", "M29.7489 70.2317L30.4022 69.166L29.7489 70.2317ZM25.789 66.27L26.8549 65.6171L25.789 66.27ZM70.2325 66.27L69.1665 65.6171L70.2325 66.27ZM66.2725 70.2317L65.6192 69.166L66.2725 70.2317ZM66.2725 32.9683L65.6192 34.034L66.2725 32.9683ZM70.2325 36.93L69.1665 37.5829L70.2325 36.93ZM29.7489 32.9683L30.4022 34.034L29.7489 32.9683ZM25.789 36.93L26.8549 37.5829L25.789 36.93ZM63.548 25.3115L64.4503 24.4464V24.4464L63.548 25.3115ZM28.4456 26.1379L29.2006 27.1342V27.1342L28.4456 26.1379ZM26.0712 28.6144L27.0969 29.3289L26.0712 28.6144ZM64.8032 31.5128H66.0532L66.0532 31.5066L64.8032 31.5128ZM63.2766 51.3228C63.967 51.3228 64.5266 50.7631 64.5266 50.0728C64.5266 49.3824 63.967 48.8228 63.2766 48.8228V51.3228ZM56.7341 48.8228C56.0437 48.8228 55.4841 49.3824 55.4841 50.0728C55.4841 50.7631 56.0437 51.3228 56.7341 51.3228V48.8228ZM44.4123 32.45H51.6091V29.95H44.4123V32.45ZM51.6091 70.75H44.4123V73.25H51.6091V70.75ZM44.4123 70.75C40.4618 70.75 37.5866 70.7487 35.3358 70.5346C33.1037 70.3223 31.615 69.9095 30.4022 69.166L29.0956 71.2974C30.7672 72.3222 32.6838 72.7936 35.0991 73.0233C37.4958 73.2513 40.5102 73.25 44.4123 73.25V70.75ZM22.7714 51.6C22.7714 55.5039 22.7701 58.5196 22.998 60.9172C23.2276 63.3334 23.6988 65.2507 24.723 66.9229L26.8549 65.6171C26.1116 64.4036 25.699 62.914 25.4868 60.6807C25.2728 58.4288 25.2714 55.5523 25.2714 51.6H22.7714ZM30.4022 69.166C28.9565 68.2797 27.7409 67.0636 26.8549 65.6171L24.723 66.9229C25.8151 68.7057 27.3134 70.2048 29.0956 71.2974L30.4022 69.166ZM51.6091 73.25C55.5113 73.25 58.5257 73.2513 60.9223 73.0233C63.3376 72.7936 65.2543 72.3222 66.9259 71.2974L65.6192 69.166C64.4065 69.9095 62.9178 70.3223 60.6856 70.5346C58.4348 70.7487 55.5597 70.75 51.6091 70.75V73.25ZM69.1665 65.6171C68.2805 67.0636 67.0649 68.2797 65.6192 69.166L66.9259 71.2974C68.708 70.2048 70.2064 68.7057 71.2984 66.9229L69.1665 65.6171ZM65.6192 34.034C67.0649 34.9203 68.2805 36.1364 69.1665 37.5829L71.2984 36.2771C70.2064 34.4943 68.708 32.9952 66.9259 31.9026L65.6192 34.034ZM44.4123 29.95C40.5102 29.95 37.4958 29.9487 35.0991 30.1767C32.6838 30.4064 30.7672 30.8778 29.0956 31.9026L30.4022 34.034C31.615 33.2905 33.1037 32.8778 35.3358 32.6654C37.5866 32.4513 40.4618 32.45 44.4123 32.45V29.95ZM25.2714 51.6C25.2714 47.6477 25.2728 44.7712 25.4868 42.5193C25.699 40.286 26.1116 38.7964 26.8549 37.5829L24.723 36.2771C23.6988 37.9493 23.2276 39.8666 22.998 42.2828C22.7701 44.6804 22.7714 47.6961 22.7714 51.6H25.2714ZM29.0956 31.9026C27.3134 32.9952 25.8151 34.4943 24.723 36.2771L26.8549 37.5829C27.7409 36.1364 28.9565 34.9203 30.4022 34.034L29.0956 31.9026ZM43.3402 25.25H56.2193V22.75H43.3402V25.25ZM56.2193 25.25C58.2799 25.25 59.6943 25.2529 60.7564 25.4018C61.777 25.5449 62.2856 25.8009 62.6458 26.1766L64.4503 24.4464C63.5531 23.5106 62.4211 23.1108 61.1036 22.926C59.8276 22.7471 58.2063 22.75 56.2193 22.75V25.25ZM43.3402 22.75C39.3448 22.75 36.2435 22.7481 33.7922 23.0251C31.3142 23.3052 29.3518 23.8829 27.6906 25.1416L29.2006 27.1342C30.3607 26.255 31.8211 25.7638 34.0729 25.5093C36.3513 25.2519 39.2867 25.25 43.3402 25.25V22.75ZM25.2714 44.1495C25.2714 39.9253 25.273 36.8534 25.521 34.4664C25.7668 32.0999 26.2435 30.554 27.0969 29.3289L25.0455 27.8999C23.8491 29.6174 23.301 31.6415 23.0344 34.2081C22.7699 36.7543 22.7714 39.9787 22.7714 44.1495H25.2714ZM27.6906 25.1416C26.6737 25.9123 25.7814 26.8435 25.0455 27.8999L27.0969 29.3289C27.6849 28.4847 28.3952 27.7444 29.2006 27.1342L27.6906 25.1416ZM66.0532 31.5066C66.0452 29.878 66.0097 28.5151 65.8155 27.4005C65.6157 26.2541 65.2312 25.2608 64.4503 24.4464L62.6458 26.1766C62.9701 26.5149 63.2051 26.9831 63.3526 27.8296C63.5056 28.7079 63.5451 29.8693 63.5532 31.5189L66.0532 31.5066ZM22.7714 44.1495C22.7714 46.5105 22.7231 48.6282 22.7719 50.4337L25.271 50.3663C25.2233 48.6015 25.2714 46.5983 25.2714 44.1495H22.7714ZM70.8005 55.3682H56.7341V57.8682H70.8005V55.3682ZM48.9416 50.0728C48.9416 54.3775 52.4299 57.8682 56.7341 57.8682V55.3682C53.8116 55.3682 51.4416 52.9979 51.4416 50.0728H48.9416ZM51.4416 50.0728C51.4416 47.1476 53.8116 44.7773 56.7341 44.7773V42.2773C52.4299 42.2773 48.9416 45.768 48.9416 50.0728H51.4416ZM63.2766 48.8228H56.7341V51.3228H63.2766V48.8228ZM51.6091 32.45C54.9244 32.45 57.4874 32.4505 59.5678 32.579C61.6468 32.7073 63.1493 32.9595 64.3592 33.4192L65.2472 31.0822C63.6916 30.4912 61.898 30.2181 59.7218 30.0837C57.547 29.9495 54.8957 29.95 51.6091 29.95V32.45ZM64.3592 33.4192C64.8143 33.5921 65.2296 33.7951 65.6192 34.034L66.9259 31.9026C66.3966 31.5781 65.8401 31.3075 65.2472 31.0822L64.3592 33.4192ZM63.5532 31.5128V32.2507H66.0532V31.5128H63.5532ZM56.7341 44.7773H71.8666V42.2773H56.7341V44.7773ZM73.25 51.6C73.25 48.2949 73.2505 45.6318 73.1142 43.4494L70.6191 43.6052C70.7494 45.6922 70.75 48.2657 70.75 51.6H73.25ZM73.1142 43.4494C72.9279 40.4667 72.4799 38.206 71.2984 36.2771L69.1665 37.5829C70.0264 38.9867 70.4409 40.7537 70.6191 43.6052L73.1142 43.4494ZM70.75 51.6C70.75 53.4887 70.75 55.1369 70.7257 56.5975L73.2254 56.639C73.25 55.1535 73.25 53.4828 73.25 51.6H70.75ZM70.7257 56.5975C70.6479 61.2868 70.3095 63.751 69.1665 65.6171L71.2984 66.9229C72.8419 64.403 73.1484 61.2771 73.2254 56.639L70.7257 56.5975ZM70.8005 57.8682H71.9756V55.3682H70.8005V57.8682Z");
    			attr_dev(path4, "fill", "#DD4141");
    			add_location(path4, file$3, 82, 14, 4540);
    			attr_dev(svg1, "class", "icon icon-price svelte-j0uakj");
    			attr_dev(svg1, "width", "96");
    			attr_dev(svg1, "height", "96");
    			attr_dev(svg1, "viewBox", "0 0 96 96");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$3, 74, 12, 4301);
    			attr_dev(span1, "class", "title svelte-j0uakj");
    			add_location(span1, file$3, 87, 12, 9868);
    			attr_dev(a1, "class", "link svelte-j0uakj");
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$3, 73, 10, 4262);
    			attr_dev(li1, "class", "item svelte-j0uakj");
    			add_location(li1, file$3, 72, 8, 4233);
    			attr_dev(path5, "d", "M33.8078 69.798L33.3102 70.9447L33.8078 69.798ZM27.3134 62.9944L26.151 63.454L27.3134 62.9944ZM68.6866 62.9944L69.849 63.454L68.6866 62.9944ZM62.1922 69.798L62.6898 70.9447L62.1922 69.798ZM26.4 45.555L27.6451 45.6656L27.7063 44.9771L27.1556 44.5592L26.4 45.555ZM66 34.7549V33.5049V34.7549ZM49.8426 32.0888L50.7265 32.9726L49.8426 32.0888ZM54.9338 26.9976L55.8177 27.8815L54.9338 26.9976ZM63.4191 26.9976L62.5352 27.8815L63.4191 26.9976ZM64.0404 34.7549L64.0405 36.0049L64.6784 36.0049L65.0527 35.4883L64.0404 34.7549ZM46.5338 32.0888L45.65 32.9727L46.5338 32.0888ZM41.4427 26.9976L40.5588 27.8815V27.8815L41.4427 26.9976ZM32.9574 26.9976L33.8413 27.8815V27.8815L32.9574 26.9976ZM48 68.3549H49.25H48ZM26.3221 45.4958L25.5552 46.4829H25.5552L26.3221 45.4958ZM69.4449 45.668L68.7264 44.6452L69.4449 45.668ZM44.4 69.5049C41.5864 69.5049 39.5418 69.5042 37.9233 69.3885C36.3171 69.2737 35.2248 69.0503 34.3054 68.6513L33.3102 70.9447C34.5961 71.5027 36.0042 71.7577 37.745 71.8821C39.4734 72.0057 41.6223 72.0049 44.4 72.0049V69.5049ZM25.1501 51.8978C25.1501 54.8103 25.1494 57.0544 25.2669 58.8576C25.3849 60.6709 25.6262 62.1268 26.151 63.454L28.4759 62.5348C28.0872 61.5518 27.8718 60.3881 27.7616 58.6951C27.6507 56.992 27.6501 54.843 27.6501 51.8978H25.1501ZM34.3054 68.6513C31.6801 67.5121 29.5765 65.3186 28.4759 62.5348L26.151 63.454C27.4862 66.8309 30.0548 69.532 33.3102 70.9447L34.3054 68.6513ZM68.35 51.8978C68.35 54.8429 68.3494 56.992 68.2385 58.6951C68.1282 60.3881 67.9128 61.5518 67.5241 62.5348L69.849 63.454C70.3738 62.1268 70.6151 60.6709 70.7332 58.8576C70.8506 57.0543 70.85 54.8102 70.85 51.8978H68.35ZM51.6 72.0049C54.3777 72.0049 56.5266 72.0057 58.255 71.8821C59.9958 71.7577 61.4039 71.5027 62.6898 70.9447L61.6946 68.6513C60.7752 69.0503 59.6829 69.2737 58.0767 69.3885C56.4582 69.5042 54.4136 69.5049 51.6 69.5049V72.0049ZM67.5241 62.5348C66.4235 65.3186 64.3199 67.5121 61.6946 68.6513L62.6898 70.9447C65.9452 69.532 68.5138 66.8309 69.849 63.454L67.5241 62.5348ZM27.6501 51.8978C27.6501 48.4307 27.4859 47.4577 27.6451 45.6656L25.1549 45.4444C24.9842 47.3656 25.1501 48.743 25.1501 51.8978H27.6501ZM66 36.0049C68.6234 36.0049 70.75 38.1316 70.75 40.7549H73.25C73.25 36.7509 70.0041 33.5049 66 33.5049V36.0049ZM30 33.5049C25.9959 33.5049 22.75 36.7509 22.75 40.7549H25.25C25.25 38.1316 27.3766 36.0049 30 36.0049V33.5049ZM50.7265 32.9726L55.8177 27.8815L54.0499 26.1137L48.9588 31.2049L50.7265 32.9726ZM55.8177 27.8815C57.6727 26.0265 60.6802 26.0265 62.5352 27.8815L64.303 26.1137C61.4717 23.2824 56.8812 23.2824 54.0499 26.1137L55.8177 27.8815ZM48.9588 31.2049C48.2019 31.9618 47.1553 33.0942 46.7936 34.4277L49.2064 35.0822C49.3745 34.4625 49.9498 33.7494 50.7265 32.9726L48.9588 31.2049ZM62.5352 27.8815C64.2076 29.5539 64.3728 32.1654 63.0281 34.0216L65.0527 35.4883C67.1067 32.6531 66.8577 28.6684 64.303 26.1137L62.5352 27.8815ZM47.4177 31.2049L42.3266 26.1137L40.5588 27.8815L45.65 32.9727L47.4177 31.2049ZM42.3266 26.1137C39.4953 23.2824 34.9048 23.2824 32.0735 26.1137L33.8413 27.8815C35.6963 26.0265 38.7038 26.0265 40.5588 27.8815L42.3266 26.1137ZM45.65 32.9727C46.2194 33.5421 46.5673 34.2481 46.7936 35.0822L49.2064 34.4277C48.9028 33.3086 48.3819 32.1691 47.4177 31.2049L45.65 32.9727ZM32.0735 26.1137C29.5188 28.6685 29.2698 32.6531 31.3238 35.4883L33.3484 34.0216C32.0037 32.1654 32.1689 29.5539 33.8413 27.8815L32.0735 26.1137ZM46.75 34.755L46.75 68.3549H49.25L49.25 34.755H46.75ZM32.3361 36.0049L48 36.005L48 33.505L32.3361 33.5049L32.3361 36.0049ZM30 45.5049C28.9015 45.5049 27.8932 45.1336 27.089 44.5087L25.5552 46.4829C26.7825 47.4365 28.3266 48.0049 30 48.0049V45.5049ZM27.089 44.5087C25.9677 43.6376 25.25 42.2804 25.25 40.7549H22.75C22.75 43.085 23.8506 45.1586 25.5552 46.4829L27.089 44.5087ZM27.1556 44.5592L27.0777 44.5001L25.5664 46.4916L25.6444 46.5507L27.1556 44.5592ZM51.6 69.5049H48V72.0049H51.6V69.5049ZM48 69.5049H44.4V72.0049H48V69.5049ZM46.75 68.3549L46.75 70.7549L49.25 70.7549L49.25 68.3549L46.75 68.3549ZM66 45.5049H48V48.0049H66V45.5049ZM48 45.5049H30V48.0049H48V45.5049ZM70.75 40.7549C70.75 42.3624 69.9527 43.7837 68.7264 44.6452L70.1635 46.6909C72.0275 45.3814 73.25 43.211 73.25 40.7549H70.75ZM68.7264 44.6452C67.9551 45.187 67.0165 45.5049 66 45.5049V48.0049C67.5474 48.0049 68.985 47.5188 70.1635 46.6909L68.7264 44.6452ZM70.85 51.8978C70.85 48.6653 70.8508 47.4161 70.6903 45.5603L68.1996 45.7757C68.3492 47.505 68.35 48.6438 68.35 51.8978H70.85ZM48 36.005L63.4191 36.0049L63.4191 33.5049L48 33.505L48 36.005ZM63.4192 36.0049L64.0405 36.0049L64.0403 33.5049L63.419 33.5049L63.4192 36.0049ZM63.4191 36.0049L66 36.0049L66 33.5049L63.4191 33.5049L63.4191 36.0049ZM32.3361 33.5049H30V36.0049H32.3361V33.5049ZM30 36.0049L39 36.005L39 33.505L30 33.5049L30 36.0049ZM39 36.005L48 36.005L48 33.505L39 33.505L39 36.005ZM32.3361 36.0049L39 36.005L39 33.505L32.3361 33.5049L32.3361 36.0049ZM48 36.005L64.0404 36.0049L64.0404 33.5049L48 33.505L48 36.005Z");
    			attr_dev(path5, "fill", "#DD4141");
    			add_location(path5, file$3, 100, 14, 10246);
    			attr_dev(svg2, "class", "icon icon-gift svelte-j0uakj");
    			attr_dev(svg2, "width", "96");
    			attr_dev(svg2, "height", "96");
    			attr_dev(svg2, "viewBox", "0 0 96 96");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg2, file$3, 92, 12, 10008);
    			attr_dev(span2, "class", "title svelte-j0uakj");
    			add_location(span2, file$3, 105, 12, 15272);
    			attr_dev(a2, "class", "link svelte-j0uakj");
    			attr_dev(a2, "href", "/");
    			add_location(a2, file$3, 91, 10, 9969);
    			attr_dev(li2, "class", "item svelte-j0uakj");
    			add_location(li2, file$3, 90, 8, 9940);
    			attr_dev(ul, "class", "list svelte-j0uakj");
    			add_location(ul, file$3, 37, 6, 1424);
    			attr_dev(div1, "class", "content svelte-j0uakj");
    			add_location(div1, file$3, 9, 4, 304);
    			attr_dev(div2, "class", "wrapper");
    			add_location(div2, file$3, 8, 2, 277);
    			attr_dev(section, "class", "section services svelte-j0uakj");
    			attr_dev(section, "id", "services");
    			set_style(section, "background-image", "url(" + /*bgUrl*/ ctx[0] + ")");
    			add_location(section, file$3, 7, 0, 186);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			mount_component(sectionheading, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(div0, t4);
    			append_dev(div0, p2);
    			append_dev(div0, t6);
    			append_dev(div0, p3);
    			append_dev(div1, t8);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(svg0, path2);
    			append_dev(svg0, path3);
    			append_dev(a0, t9);
    			append_dev(a0, span0);
    			append_dev(ul, t11);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, svg1);
    			append_dev(svg1, path4);
    			append_dev(a1, t12);
    			append_dev(a1, span1);
    			append_dev(ul, t14);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, svg2);
    			append_dev(svg2, path5);
    			append_dev(a2, t15);
    			append_dev(a2, span2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sectionheading_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				sectionheading_changes.$$scope = { dirty, ctx };
    			}

    			sectionheading.$set(sectionheading_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionheading.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheading.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(sectionheading);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Services', slots, []);
    	let bgUrl = "../content/Services/bg.jpg";
    	let sectionTitle = "Дополнительные развлечения и услуги";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Services> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SectionHeading, bgUrl, sectionTitle });

    	$$self.$inject_state = $$props => {
    		if ('bgUrl' in $$props) $$invalidate(0, bgUrl = $$props.bgUrl);
    		if ('sectionTitle' in $$props) $$invalidate(1, sectionTitle = $$props.sectionTitle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bgUrl, sectionTitle];
    }

    class Services extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Services",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\SportsComplex.svelte generated by Svelte v3.43.2 */
    const file$2 = "src\\components\\SportsComplex.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (60:6) 
    function create_title_slot$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = `${/*sectionTitle*/ ctx[1]}`;
    			attr_dev(span, "slot", "title");
    			add_location(span, file$2, 59, 6, 6122);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot$1.name,
    		type: "slot",
    		source: "(60:6) ",
    		ctx
    	});

    	return block;
    }

    // (61:6) 
    function create_subtitle_slot$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = `${/*sectionSubtitle*/ ctx[2]}`;
    			attr_dev(span, "slot", "subtitle");
    			add_location(span, file$2, 60, 6, 6170);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_subtitle_slot$1.name,
    		type: "slot",
    		source: "(61:6) ",
    		ctx
    	});

    	return block;
    }

    // (65:6) {#each items as item}
    function create_each_block(ctx) {
    	let article;
    	let div0;
    	let svg;
    	let raw_value = /*item*/ ctx[4].svgIconPath + "";
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div1;
    	let h4;
    	let t2_value = /*item*/ ctx[4].title + "";
    	let t2;
    	let t3;
    	let p;
    	let t4_value = /*item*/ ctx[4].descr + "";
    	let t4;
    	let t5;
    	let a;
    	let t6;
    	let t7;

    	const block = {
    		c: function create() {
    			article = element("article");
    			div0 = element("div");
    			svg = svg_element("svg");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div1 = element("div");
    			h4 = element("h4");
    			t2 = text(t2_value);
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			a = element("a");
    			t6 = text("Подробнее");
    			t7 = space();
    			attr_dev(svg, "class", "item-icon svelte-15iuclr");
    			attr_dev(svg, "width", "128");
    			attr_dev(svg, "height", "128");
    			attr_dev(svg, "viewBox", "0 0 128 128");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$2, 67, 12, 6372);
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[4].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*item*/ ctx[4].title);
    			add_location(img, file$2, 77, 12, 6667);
    			attr_dev(div0, "class", "image svelte-15iuclr");
    			add_location(div0, file$2, 66, 10, 6339);
    			attr_dev(h4, "class", "title svelte-15iuclr");
    			add_location(h4, file$2, 80, 12, 6771);
    			attr_dev(p, "class", "descr svelte-15iuclr");
    			add_location(p, file$2, 81, 12, 6820);
    			attr_dev(div1, "class", "content svelte-15iuclr");
    			add_location(div1, file$2, 79, 10, 6736);
    			attr_dev(a, "class", "more svelte-15iuclr");
    			attr_dev(a, "href", /*item*/ ctx[4].urlMore);
    			add_location(a, file$2, 83, 10, 6883);
    			attr_dev(article, "class", "item svelte-15iuclr");
    			add_location(article, file$2, 65, 8, 6305);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div0);
    			append_dev(div0, svg);
    			svg.innerHTML = raw_value;
    			append_dev(div0, t0);
    			append_dev(div0, img);
    			append_dev(article, t1);
    			append_dev(article, div1);
    			append_dev(div1, h4);
    			append_dev(h4, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(p, t4);
    			append_dev(article, t5);
    			append_dev(article, a);
    			append_dev(a, t6);
    			append_dev(article, t7);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(65:6) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let div1;
    	let sectionheading;
    	let t;
    	let div0;
    	let current;

    	sectionheading = new SectionHeading({
    			props: {
    				$$slots: {
    					subtitle: [create_subtitle_slot$1],
    					title: [create_title_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = /*items*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			create_component(sectionheading.$$.fragment);
    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "items svelte-15iuclr");
    			add_location(div0, file$2, 63, 4, 6247);
    			attr_dev(div1, "class", "wrapper");
    			add_location(div1, file$2, 57, 2, 6071);
    			attr_dev(section, "class", "section sports-complex svelte-15iuclr");
    			attr_dev(section, "id", "sportsComplex");
    			set_style(section, "background-image", "url(" + /*bgUrl*/ ctx[0] + ")");
    			add_location(section, file$2, 52, 0, 5958);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			mount_component(sectionheading, div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sectionheading_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				sectionheading_changes.$$scope = { dirty, ctx };
    			}

    			sectionheading.$set(sectionheading_changes);

    			if (dirty & /*items*/ 8) {
    				each_value = /*items*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionheading.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheading.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(sectionheading);
    			destroy_each(each_blocks, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SportsComplex', slots, []);
    	let bgUrl = "../content/SportsComplex/bg.jpg";
    	let sectionTitle = "Спортивный комплекс";
    	let sectionSubtitle = "Горнолыжный комплекс находится в городе Нижний Тагил Свердловской области, на склонах горы Долгой горного хребта Весёлые горы Среднего Урала";

    	let items = [
    		{
    			title: "Трамплины",
    			descr: "Комплекс трамплинов включает в себя 4 трамплина проектной мощностью: К-5, К-20, К-40, К-60, К-90, К-120.",
    			img: "./content/SportsComplex/item-1.jpg",
    			svgIconPath: `
              <path
                d="M120.042 26.6401C120.042 32.5782 115.228 37.3921 109.29 37.3921C103.351 37.3921 98.5376 32.5782 98.5376 26.6401C98.5376 20.7019 103.351 15.8881 109.29 15.8881C115.228 15.8881 120.042 20.7019 120.042 26.6401Z"
                fill="white"
              />
              <path
                d="M35.6182 35.0595C32.3238 39.0702 36.3344 40.6458 52.5203 42.2214L67.8467 43.6538L61.1145 48.3806C53.3797 53.6804 22.2972 93.0707 22.0107 97.9408C21.8674 100.089 19.8621 101.665 14.7056 103.527C10.8382 104.959 6.68427 107.108 5.53837 108.254C3.81952 109.973 3.81952 110.546 5.68161 112.408C7.68693 114.413 13.13 112.694 60.5416 95.076C91.9106 83.3306 114.972 74.0201 117.407 71.8716C123.709 66.715 125.142 63.1341 122.42 60.4126C120.272 58.264 119.699 58.5505 114.829 63.2773C110.388 67.4312 102.94 70.7257 72.287 82.1847C51.9473 89.7763 35.0453 95.7922 34.7588 95.649C33.6129 94.3599 62.4036 72.4445 77.73 62.9908C96.9239 50.9589 100.218 47.2347 97.3536 40.5026C94.6321 33.7704 90.9079 32.911 62.9766 32.911C41.6342 32.911 37.0506 33.3407 35.6182 35.0595Z"
                fill="white"
              />
            `,
    			urlMore: "#"
    		},
    		{
    			title: "Горнолыжные трассы",
    			descr: "Комплекс горнолыжных трасс включает в себя 4 трассы: учебная, спортивная, туристическая, дальняя. Протяженность трасс от 190 до 720 м, с максимальным перепадом высот 112 м.",
    			img: "./content/SportsComplex/item-2.jpg",
    			svgIconPath: `
          <path d="M72.9545 22.0442C72.9545 27.5425 68.4972 31.9997 62.9989 31.9997C57.5006 31.9997 53.0434 27.5425 53.0434 22.0442C53.0434 16.5459 57.5006 12.0886 62.9989 12.0886C68.4972 12.0886 72.9545 16.5459 72.9545 22.0442Z" fill="white"/>
          <path d="M95.1472 20.7643C91.1649 24.7465 84.0538 30.2931 79.3605 33.1376C65.8494 41.2443 41.956 57.3154 40.9605 59.1643C40.3916 60.0176 40.9605 61.7243 42.0983 62.862C44.0894 64.8531 45.5116 64.2843 56.7472 57.742L69.4049 50.4887L71.8227 55.182C73.1027 57.5998 74.2405 60.1598 74.3827 60.5865C74.3827 61.1554 71.5383 62.2931 67.9827 63.2887C63.716 64.4265 59.876 66.9865 56.4627 70.8265L51.2005 76.5154L54.6138 79.0754C58.0272 81.6354 58.0272 81.6354 60.8716 78.222C62.8627 75.8043 65.7072 74.5243 71.2538 73.8131C75.236 73.3865 78.6494 73.2443 78.6494 73.5287C78.6494 73.9554 77.6538 77.0843 76.516 80.3554C73.3872 89.3154 73.8138 93.8665 77.9383 96.5687C82.6316 99.6976 82.916 99.5554 82.916 94.4354C82.916 91.3065 85.1916 86.8976 90.7383 79.3598C95.0049 73.3865 98.5605 67.1287 98.5605 65.2798C98.5605 63.4309 96.1427 57.1731 93.2983 51.342L88.036 40.6754L98.276 30.0087C103.965 24.3198 108.516 18.9154 108.516 18.2043C108.516 16.4976 105.529 13.5109 103.823 13.5109C103.112 13.5109 99.2716 16.782 95.1472 20.7643Z" fill="white"/>
          <path d="M43.094 101.546L63.7162 115.911L90.9244 115.911C90.2133 115.2 75.094 104.106 59.5918 92.5865C46.9563 83.3971 36.8511 76.5078 31.5842 73.4951C31.5842 73.4951 25.9265 69.9016 21.1495 75.5943C17.1467 81.4478 21.4857 85.7586 22.4819 86.5668C26.0686 89.4768 34.1893 95.4245 43.094 101.546Z" fill="white"/>
        `,
    			urlMore: "#"
    		},
    		{
    			title: "Лыжный стадион",
    			descr: "На лыжном стадионе имеются несколько беговых лыжных трасс. Летом на стадионе открывается лыжероллерная трасса.",
    			img: "./content/SportsComplex/item-3.jpg",
    			svgIconPath: `
          <path d="M116.928 21.6951C116.928 27.2719 112.407 31.7928 106.83 31.7928C101.253 31.7928 96.7324 27.2719 96.7324 21.6951C96.7324 16.1182 101.253 11.5973 106.83 11.5973C112.407 11.5973 116.928 16.1182 116.928 21.6951Z" fill="white"/>
          <path d="M11.6605 16.402C11.5994 16.5076 11.455 16.9132 11.7328 17.3409C12.9945 19.1897 18.5224 23.9496 25.2782 29.0165C33.3849 35.132 40.7804 41.2476 41.776 42.6698C42.7715 44.092 44.1937 45.2298 45.0471 45.2298C45.7582 45.2298 50.0249 42.2431 54.7182 38.6876C60.976 33.852 64.1049 32.2876 67.0916 32.7142C70.9316 33.1409 70.7893 33.2831 63.2516 39.1142C56.5671 44.2342 54.576 46.9365 50.4515 56.4654C46.6115 65.2831 43.1982 70.1186 34.6649 79.0786C23.9982 90.3142 23.5715 90.5986 19.0204 89.1764C15.7271 88.1473 14.1727 86.8113 11.8411 88.9913C10.0697 91.0806 11.2204 93.3818 12.1938 94.1542C13.3315 95.292 69.4628 110.312 90.9384 116.286C93.2523 116.815 94.9713 115.475 95.5272 113.824C96.1939 111.735 94.9939 109.552 92.923 109.005C76.8519 104.596 34.096 93.3009 33.9537 93.0164C33.8115 92.8742 40.6382 85.9053 49.1715 77.372L64.6738 62.1542L70.3627 65.4254C76.7627 68.9809 76.9049 69.4075 78.3271 80.3587L79.3227 87.8964H62.5404C53.4382 87.8964 46.1849 88.1809 46.6115 88.6075C47.0382 89.0342 53.296 91.0253 60.4071 92.8742C71.5004 95.8609 76.7627 96.4298 93.8293 96.4298C104.893 96.4298 109.661 96.4298 111.775 96.4298C111.775 96.4298 117.083 96.4298 117.083 92.1631C117.083 87.8964 111.775 87.8964 111.775 87.8964H87.5716V76.5187C87.5716 65.5675 87.4293 64.9987 82.5938 59.5942L77.4738 54.0476L86.0071 47.3631C94.9671 40.3942 96.9582 36.412 94.6827 30.4387C92.8338 25.3187 88.1404 23.8964 73.4916 23.8964H60.976L52.5849 30.2965C48.0337 33.7098 43.6249 36.6965 42.9137 36.6965C42.2026 36.6965 35.8027 32.2876 28.6915 27.0253C17.0929 18.3264 13.8645 15.8861 12.527 15.8611C12.2105 15.8465 11.8328 16.0354 11.6605 16.402Z" fill="white"/>
        `,
    			urlMore: "#"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SportsComplex> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		SectionHeading,
    		bgUrl,
    		sectionTitle,
    		sectionSubtitle,
    		items
    	});

    	$$self.$inject_state = $$props => {
    		if ('bgUrl' in $$props) $$invalidate(0, bgUrl = $$props.bgUrl);
    		if ('sectionTitle' in $$props) $$invalidate(1, sectionTitle = $$props.sectionTitle);
    		if ('sectionSubtitle' in $$props) $$invalidate(2, sectionSubtitle = $$props.sectionSubtitle);
    		if ('items' in $$props) $$invalidate(3, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bgUrl, sectionTitle, sectionSubtitle, items];
    }

    class SportsComplex extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SportsComplex",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\SubscribeForm.svelte generated by Svelte v3.43.2 */

    const file$1 = "src\\components\\SubscribeForm.svelte";

    function create_fragment$2(ctx) {
    	let form;
    	let div;
    	let input;
    	let t0;
    	let button;
    	let t1;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			t1 = text("Подписаться\r\n      ");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			attr_dev(input, "class", "email-input svelte-1s9p0pz");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "E-mail адрес");
    			add_location(input, file$1, 2, 4, 84);
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "clip-rule", "evenodd");
    			attr_dev(path0, "d", "M22.4689 7.36431C23.08 4.17771 20.2824 1.38009 17.0958 1.99123L7.94673 3.74587C5.95789 4.1273 4.36735 5.63275 3.86202 7.58892C2.85311 11.4945 6.47515 15.0639 10.3642 13.9203C10.4716 13.8887 10.5714 13.9885 10.5398 14.0959C9.39617 17.985 12.9656 21.607 16.8712 20.5981C18.8274 20.0928 20.3328 18.5022 20.7142 16.5134L22.4689 7.36431ZM17.3783 3.46438C19.5237 3.05294 21.4072 4.93642 20.9957 7.08178L19.2411 16.2308C18.9697 17.6457 17.8955 18.7843 16.496 19.1458C13.6989 19.8683 11.1695 17.2715 11.9789 14.519C12.3454 13.2727 11.1874 12.1147 9.94105 12.4812C7.18864 13.2906 4.59178 10.7612 5.31435 7.96409C5.67585 6.56466 6.81437 5.49038 8.22926 5.21903L17.3783 3.46438Z");
    			attr_dev(path0, "fill", "#D8EAF4");
    			add_location(path0, file$1, 17, 8, 421);
    			attr_dev(path1, "d", "M4.94454 16.3336C5.23744 16.0407 5.23744 15.5658 4.94454 15.2729C4.65165 14.98 4.17678 14.98 3.88388 15.2729L2.46967 16.6872C2.17678 16.98 2.17678 17.4549 2.46967 17.7478C2.76256 18.0407 3.23744 18.0407 3.53033 17.7478L4.94454 16.3336Z");
    			attr_dev(path1, "fill", "#D8EAF4");
    			add_location(path1, file$1, 23, 8, 1219);
    			attr_dev(path2, "d", "M8.48008 17.0407C8.77297 16.7478 8.77297 16.2729 8.48008 15.98C8.18718 15.6872 7.71231 15.6872 7.41942 15.98L6.0052 17.3943C5.71231 17.6872 5.71231 18.162 6.0052 18.4549C6.2981 18.7478 6.77297 18.7478 7.06586 18.4549L8.48008 17.0407Z");
    			attr_dev(path2, "fill", "#D8EAF4");
    			add_location(path2, file$1, 27, 8, 1523);
    			attr_dev(path3, "d", "M9.18718 20.5762C9.48008 20.2833 9.48008 19.8085 9.18718 19.5156C8.89429 19.2227 8.41942 19.2227 8.12652 19.5156L6.71231 20.9298C6.41942 21.2227 6.41942 21.6976 6.71231 21.9905C7.0052 22.2833 7.48008 22.2833 7.77297 21.9905L9.18718 20.5762Z");
    			attr_dev(path3, "fill", "#D8EAF4");
    			add_location(path3, file$1, 31, 8, 1825);
    			attr_dev(svg, "class", "send-icon svelte-1s9p0pz");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$1, 9, 6, 236);
    			attr_dev(button, "class", "send-btn svelte-1s9p0pz");
    			add_location(button, file$1, 7, 4, 184);
    			attr_dev(div, "class", "fields svelte-1s9p0pz");
    			add_location(div, file$1, 1, 2, 58);
    			attr_dev(form, "class", "subscribe-form svelte-1s9p0pz");
    			attr_dev(form, "action", "#");
    			attr_dev(form, "method", "POST");
    			add_location(form, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div);
    			append_dev(div, input);
    			append_dev(div, t0);
    			append_dev(div, button);
    			append_dev(button, t1);
    			append_dev(button, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
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

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SubscribeForm', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SubscribeForm> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SubscribeForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SubscribeForm",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Subscribe.svelte generated by Svelte v3.43.2 */
    const file = "src\\components\\Subscribe.svelte";

    // (14:8) 
    function create_title_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = `${/*sectionTitle*/ ctx[0]}`;
    			attr_dev(span, "slot", "title");
    			add_location(span, file, 13, 8, 454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(14:8) ",
    		ctx
    	});

    	return block;
    }

    // (15:8) 
    function create_subtitle_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = `${/*sectionSubtitle*/ ctx[1]}`;
    			attr_dev(span, "class", "subtitle svelte-16lyqnl");
    			attr_dev(span, "slot", "subtitle");
    			add_location(span, file, 14, 8, 504);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_subtitle_slot.name,
    		type: "slot",
    		source: "(15:8) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let div1;
    	let div0;
    	let sectionheading;
    	let t;
    	let subscribeform;
    	let current;

    	sectionheading = new SectionHeading({
    			props: {
    				$$slots: {
    					subtitle: [create_subtitle_slot],
    					title: [create_title_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	subscribeform = new SubscribeForm({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(sectionheading.$$.fragment);
    			t = space();
    			create_component(subscribeform.$$.fragment);
    			attr_dev(div0, "class", "content svelte-16lyqnl");
    			add_location(div0, file, 11, 4, 399);
    			attr_dev(div1, "class", "wrapper");
    			add_location(div1, file, 10, 2, 372);
    			attr_dev(section, "class", "section subscribe svelte-16lyqnl");
    			add_location(section, file, 9, 0, 333);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, div0);
    			mount_component(sectionheading, div0, null);
    			append_dev(div0, t);
    			mount_component(subscribeform, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sectionheading_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				sectionheading_changes.$$scope = { dirty, ctx };
    			}

    			sectionheading.$set(sectionheading_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionheading.$$.fragment, local);
    			transition_in(subscribeform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheading.$$.fragment, local);
    			transition_out(subscribeform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(sectionheading);
    			destroy_component(subscribeform);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Subscribe', slots, []);
    	let sectionTitle = "Подпишитесь на нас";
    	let sectionSubtitle = "Будьте всегда в курсе последних новостей и событий, получайте полезные советы и предложения прямо на ваш почтовый ящик";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Subscribe> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		SectionHeading,
    		SubscribeForm,
    		sectionTitle,
    		sectionSubtitle
    	});

    	$$self.$inject_state = $$props => {
    		if ('sectionTitle' in $$props) $$invalidate(0, sectionTitle = $$props.sectionTitle);
    		if ('sectionSubtitle' in $$props) $$invalidate(1, sectionSubtitle = $$props.sectionSubtitle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [sectionTitle, sectionSubtitle];
    }

    class Subscribe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subscribe",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.43.2 */

    // (26:0) {#if y > 1000}
    function create_if_block(ctx) {
    	let backtotop;
    	let current;
    	backtotop = new BackToTop({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(backtotop.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(backtotop, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(backtotop.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backtotop.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(backtotop, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(26:0) {#if y > 1000}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let main;
    	let t0;
    	let sportscomplex;
    	let t1;
    	let hotelcomplex;
    	let t2;
    	let services;
    	let t3;
    	let address;
    	let t4;
    	let news;
    	let t5;
    	let subscribe_1;
    	let t6;
    	let footer;
    	let t7;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[1]);
    	main = new Main({ $$inline: true });
    	sportscomplex = new SportsComplex({ $$inline: true });
    	hotelcomplex = new HotelComplex({ $$inline: true });
    	services = new Services({ $$inline: true });
    	address = new Address({ $$inline: true });
    	news = new News({ $$inline: true });
    	subscribe_1 = new Subscribe({ $$inline: true });
    	footer = new Footer({ $$inline: true });
    	let if_block = /*y*/ ctx[0] > 1000 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(main.$$.fragment);
    			t0 = space();
    			create_component(sportscomplex.$$.fragment);
    			t1 = space();
    			create_component(hotelcomplex.$$.fragment);
    			t2 = space();
    			create_component(services.$$.fragment);
    			t3 = space();
    			create_component(address.$$.fragment);
    			t4 = space();
    			create_component(news.$$.fragment);
    			t5 = space();
    			create_component(subscribe_1.$$.fragment);
    			t6 = space();
    			create_component(footer.$$.fragment);
    			t7 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(main, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(sportscomplex, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(hotelcomplex, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(services, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(address, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(news, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(subscribe_1, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(footer, target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "scroll", () => {
    					scrolling = true;
    					clearTimeout(scrolling_timeout);
    					scrolling_timeout = setTimeout(clear_scrolling, 100);
    					/*onwindowscroll*/ ctx[1]();
    				});

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*y*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*y*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (/*y*/ ctx[0] > 1000) {
    				if (if_block) {
    					if (dirty & /*y*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			transition_in(main.$$.fragment, local);
    			transition_in(sportscomplex.$$.fragment, local);
    			transition_in(hotelcomplex.$$.fragment, local);
    			transition_in(services.$$.fragment, local);
    			transition_in(address.$$.fragment, local);
    			transition_in(news.$$.fragment, local);
    			transition_in(subscribe_1.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(main.$$.fragment, local);
    			transition_out(sportscomplex.$$.fragment, local);
    			transition_out(hotelcomplex.$$.fragment, local);
    			transition_out(services.$$.fragment, local);
    			transition_out(address.$$.fragment, local);
    			transition_out(news.$$.fragment, local);
    			transition_out(subscribe_1.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(main, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(sportscomplex, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(hotelcomplex, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(services, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(address, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(news, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(subscribe_1, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(footer, detaching);
    			if (detaching) detach_dev(t7);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let y;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(0, y = window.pageYOffset);
    	}

    	$$self.$capture_state = () => ({
    		Address,
    		BackToTop,
    		Footer,
    		HotelComplex,
    		Main,
    		News,
    		Services,
    		SportsComplex,
    		Subscribe,
    		y
    	});

    	$$self.$inject_state = $$props => {
    		if ('y' in $$props) $$invalidate(0, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [y, onwindowscroll];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
