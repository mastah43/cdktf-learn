# TODO create DRY makefile https://stackoverflow.com/questions/19307258/how-to-include-a-makefile-into-an-other-makefile when having multiple lambdas
# TODO specify same python version as used in AWS runtime (python 3.9) e.g. using pyenv also to make this Makefile more interoperable (see usage of path directory python3.10)

FUNCTION=learn-cdktf-service-send-document-crucial-lion
BASE_DIR=$(shell pwd)
BUILD_DIR=$(BASE_DIR)/build
CACHE_WHEELHOUSE_DIR=$(BUILD_DIR)/cache-wheelhouse
CACHE_WHEELHOUSE_STAMP=$(BUILD_DIR)/cache-wheelhouse-stamp
STAGING_WHEELHOUSE_DIR=$(BUILD_DIR)/staging-wheelhouse
STAGING_WHEELHOUSE_STAMP=$(BUILD_DIR)/staging-wheelhouse-stamp
STAGING_DIR=$(BUILD_DIR)/staging
STAGING_STAMP=$(BUILD_DIR)/staging-stamp
OUTPUT_ZIP=$(BUILD_DIR)/idp-services.zip
UPLOAD_STAMP=$(BUILD_DIR)/upload-stamp
BUILD_DATE=$(shell date -Iseconds)
#BUILD_DATE=$(shell git log --date=local -1 --format="@%ct")

# makefile approach from: https://unrouted.io/2016/07/21/use-make/

clean:
	rm -f $(STAGING_STAMP)
	rm -rf $(STAGING_DIR)
	rm -f $(OUTPUT_ZIP)

$(CACHE_WHEELHOUSE_STAMP): $(BASE_DIR)/requirements.txt
	pip wheel -q -r requirements.txt . --wheel-dir=$(CACHE_WHEELHOUSE_DIR) --find-links=$(CACHE_WHEELHOUSE_DIR)
	touch $@

$(STAGING_WHEELHOUSE_STAMP): $(CACHE_WHEELHOUSE_STAMP)
	rm -rf $(STAGING_WHEELHOUSE_DIR)
	pip wheel -q -r requirements.txt . --wheel-dir=$(STAGING_WHEELHOUSE_DIR) --find-links=$(CACHE_WHEELHOUSE_DIR)
	touch $@

$(STAGING_STAMP): $(STAGING_WHEELHOUSE_STAMP) $(BASE_DIR)/idp-services/lambda_handlers.py
	rm -rf $(STAGING_DIR)
	unzip -q "$(STAGING_WHEELHOUSE_DIR)/*.whl" -d $(STAGING_DIR)
	cp $(BASE_DIR)/idp-services/*.py $(STAGING_DIR)/.

	# TODO problem with this touch
	#find "$(STAGING_DIR)" -newermt "$(BUILD_DATE)" -print0
	#find "$(STAGING_DIR)" -newermt "$(BUILD_DATE)" -print0 | xargs -0r echo
	#find "$(STAGING_DIR)" -newermt "$(BUILD_DATE)" -print0 | xargs -0r touch --no-dereference --date="$(BUILD_DATE)"
	touch $@

$(OUTPUT_ZIP): $(STAGING_STAMP)
	rm -f $(OUTPUT_ZIP)
	cd $(STAGING_DIR) && zip -q -9 -r $(OUTPUT_ZIP) *

$(UPLOAD_STAMP): $(OUTPUT_ZIP)
	aws lambda update-function-code --function-name $(FUNCTION) --zip-file fileb://$(OUTPUT_ZIP)
	touch $@

all: $(OUTPUT_ZIP)

upload: $(UPLOAD_STAMP)

invoke: $(UPLOAD_CODE_STAMP)
	aws lambda invoke \
      --function-name $(FUNCTION) \
      --invocation-type RequestResponse \
      --payload file://example-payload.json \
      invoke_result.json
	cat invoke_result.json

test: all
	py.test tests


.PHONY: clean test upload invoke all