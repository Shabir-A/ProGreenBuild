import { vi } from 'vitest';

/**
 * Minimal in-memory stand-in for the Supabase client surface used by the app.
 *
 * `results` lets a test decide what each terminal call resolves to, keyed by
 * `<table>.<operation>` for postgrest calls and `<bucket>.<operation>` for
 * storage calls, e.g.
 *
 *   createSupabaseMock({ user: { id: 'u1' }, results: {
 *       'gallery_items.insert': { error: { message: 'boom' } },
 *       'gallery.upload': { error: null },
 *   } })
 */
export function createSupabaseMock({ user = { id: 'user-1' }, results = {} } = {}) {
    const calls = [];
    const record = (entry) => {
        calls.push(entry);
        return entry;
    };
    const resultFor = (key, fallback) => (key in results ? results[key] : fallback);

    const queryBuilder = (table) => {
        const state = { table };
        const builder = {
            select: vi.fn((columns) => {
                state.operation = 'select';
                state.columns = columns;
                return builder;
            }),
            insert: vi.fn((values) => {
                record({ table, operation: 'insert', values });
                return Promise.resolve(resultFor(`${table}.insert`, { data: null, error: null }));
            }),
            update: vi.fn((values) => {
                state.operation = 'update';
                state.values = values;
                return builder;
            }),
            delete: vi.fn(() => {
                state.operation = 'delete';
                return builder;
            }),
            eq: vi.fn((column, value) => {
                state.filters = [...(state.filters ?? []), [column, value]];
                if (state.operation === 'select') return builder;
                record({ table, operation: state.operation, values: state.values, filters: state.filters });
                return Promise.resolve(resultFor(`${table}.${state.operation}`, { data: null, error: null }));
            }),
            order: vi.fn(() => builder),
            maybeSingle: vi.fn(() => {
                record({ table, operation: 'select', columns: state.columns, filters: state.filters });
                return Promise.resolve(resultFor(`${table}.select`, { data: null, error: null }));
            }),
            then: (onFulfilled, onRejected) =>
                Promise.resolve(
                    record({ table, operation: state.operation, columns: state.columns, filters: state.filters }) &&
                        resultFor(`${table}.${state.operation}`, { data: [], error: null })
                ).then(onFulfilled, onRejected),
        };
        return builder;
    };

    const storageBucket = (bucket) => ({
        upload: vi.fn((path, file, options) => {
            record({ bucket, operation: 'upload', path, file, options });
            return Promise.resolve(resultFor(`${bucket}.upload`, { data: { path }, error: null }));
        }),
        remove: vi.fn((paths) => {
            record({ bucket, operation: 'remove', paths });
            return Promise.resolve(resultFor(`${bucket}.remove`, { data: null, error: null }));
        }),
        getPublicUrl: vi.fn((path) => {
            record({ bucket, operation: 'getPublicUrl', path });
            return resultFor(`${bucket}.getPublicUrl`, {
                data: { publicUrl: `https://cdn.test/${bucket}/${path}` },
            });
        }),
    });

    return {
        calls,
        callsFor: (predicate) => calls.filter(predicate),
        from: vi.fn(queryBuilder),
        storage: { from: vi.fn(storageBucket) },
        auth: {
            getUser: vi.fn(() => Promise.resolve({ data: { user }, error: null })),
            signInWithPassword: vi.fn(() =>
                Promise.resolve(resultFor('auth.signInWithPassword', { data: { user }, error: null }))
            ),
            signOut: vi.fn(() => Promise.resolve({ error: null })),
        },
    };
}

/** Builds a File-like object matching what a Next.js FormData upload provides. */
export function createUpload({ type = 'image/jpeg', size = 1024, name = 'photo.jpg' } = {}) {
    return { type, size, name };
}

/** Minimal FormData stand-in so tests can pass plain objects to server actions. */
export function createFormData(entries = {}) {
    const map = new Map(Object.entries(entries));
    return { get: (key) => (map.has(key) ? map.get(key) : null) };
}
