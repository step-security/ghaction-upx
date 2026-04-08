[![StepSecurity Maintained Action](https://raw.githubusercontent.com/step-security/maintained-actions-assets/main/assets/maintained-action-banner.png)](https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions)

## About

GitHub Action for [UPX](https://github.com/upx/upx), the Ultimate Packer for eXecutables.

___

* [Usage](#usage)
* [Customizing](#customizing)
  * [inputs](#inputs)
* [Limitation](#limitation)
* [License](#license)

## Usage

```yaml
name: upx

on:
  push:

jobs:
  upx:
    runs-on: ubuntu-latest
    steps:
      - name: Run UPX
        uses: step-security/ghaction-upx@v4
        with:
          version: latest
          files: |
            ./bin/*.exe
          args: -fq
```

If you just want to install UPX:

```yaml
name: upx

on:
  push:

jobs:
  upx:
    runs-on: ubuntu-latest
    steps:
      - name: Install UPX
        uses: step-security/ghaction-upx@v4
        with:
          install-only: true
      - name: UPX version
        run: upx --version
```

## Customizing

### inputs

The following inputs can be used as `step.with` keys

| Name           | Type   | Default  | Description                                                |
|----------------|--------|----------|------------------------------------------------------------|
| `version`      | String | `latest` | UPX version. Example: `v3.95`                              |
| `files`        | String |          | Newline-delimited list of path globs for files to compress |
| `args`         | String |          | Arguments to pass to UPX                                   |
| `install-only` | String | `false`  | Just install UPX                                           |

## Limitation

This action is only available for Linux and
Windows [virtual environments](https://help.github.com/en/articles/virtual-environments-for-github-actions#supported-virtual-environments-and-hardware-resources).

## License

MIT. See `LICENSE` for more details.
