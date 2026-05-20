IMAGE_NAME = jmeter-stress-test
JMX_FILE   = test.jmx
REPORT_DIR = reports
WINDOWS_REPORT_DIR = $(subst /,\,$(CURDIR))\$(REPORT_DIR)
UNIX_REPORT_DIR = $(CURDIR)/$(REPORT_DIR)

.PHONY: all build run clean help

all: build run

build:
	@echo "--- Building JMeter image ---"
	docker build -t $(IMAGE_NAME) . --no-cache

run:
	@echo "--- Starting Stress Test ---"
ifeq ($(OS),Windows_NT)
	powershell -NoProfile -Command "New-Item -ItemType Directory -Force -Path '$(REPORT_DIR)' | Out-Null"
	docker run --rm --net host -v "$(WINDOWS_REPORT_DIR):/var/loadtest/results" $(IMAGE_NAME)
else
	@mkdir -p $(REPORT_DIR)
	docker run --rm --net host -v "$(UNIX_REPORT_DIR):/var/loadtest/results" $(IMAGE_NAME)
endif

clean:
	@echo "--- Cleaning up ---"
	-docker rmi $(IMAGE_NAME)
ifeq ($(OS),Windows_NT)
	powershell -NoProfile -Command "if (Test-Path '$(REPORT_DIR)') { Remove-Item -Path '$(REPORT_DIR)' -Recurse -Force }"
else
	rm -rf $(REPORT_DIR)
endif

help:
	@echo "Available commands:"
	@echo "  make build - Build the JMeter Docker image"
	@echo "  make run   - Run the stress test against localhost"
	@echo "  make all   - Build and Run"
	@echo "  make clean - Remove image and reports"