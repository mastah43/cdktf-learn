from distutils.core import setup

# TODO idp-services.egg-info directory is created in module root but should be better created in 'build' subdir
setup(name='idp-services',
      version='1.0',
      py_modules=['idp-services'],
      )
