import importlib
mods = ['utils','attacks','entities','game']
for m in mods:
    try:
        importlib.import_module(m)
        print(m, 'imported OK')
    except Exception as e:
        print(m, 'IMPORT ERROR:', e)
