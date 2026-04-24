IMAGE_NAME = jmeter-stress-test
JMX_FILE   = test.jmx
REPORT_DIR = reports

.PHONY: all build run clean help

all: build run

build:
	@echo "--- Building JMeter image ---"
	docker build -t $(IMAGE_NAME) . --no-cache

run:
	@echo "--- Starting Stress Test ---"
	@mkdir -p $(REPORT_DIR)
	docker run --rm --net host -v $(shell pwd)/$(REPORT_DIR):/var/loadtest/results $(IMAGE_NAME)

clean:
	@echo "--- Cleaning up ---"
	docker rmi $(IMAGE_NAME) || true
	rm -rf $(REPORT_DIR)

help:
	@echo "Available commands:"
	@echo "  make build - Build the JMeter Docker image"
	@echo "  make run   - Run the stress test against localhost"
	@echo "  make all   - Build and Run"
	@echo "  make clean - Remove image and reports"