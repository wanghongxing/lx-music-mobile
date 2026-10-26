# iOS 12.4 兼容构建

此分支以 iOS 12.4 为最低目标，用于 iPhone 6 / 6 Plus 等设备。
配置降低不代表已经通过真机验证；安装后仍需检查音源导入、播放、后台和锁屏控制。

## 依赖选择

- React Native 固定为 0.72.17（最低 iOS 12.4）；0.73 起要求 iOS 13.4。
- Metro 配置固定为 0.72.12，Babel preset 固定为 0.76.9。
- iOS 使用旧架构，禁用 Fabric 和 Flipper。
- 四个 Git 依赖改用相同 commit 的源码压缩包，避免 npm 在安装时递归安装示例工程。
- `postinstall` 为源码依赖声明 Metro / TypeScript 入口，不依赖未包含的 `lib/`。
- 启动屏使用固定白色，避免引用 iOS 13 才引入的系统背景色。
- 禁用 FastImage 的 SVG 解码器及对应原生代码（该解码器要求 iOS 13）；SVG 格式封面不可用。

## 构建

使用 Node.js 18 或更新版本、CocoaPods 1.13.x（相关 podspec 含 visionOS 声明）。

```sh
# 按本机网络需要设置代理，例如：
# export https_proxy=http://127.0.0.1:7897 http_proxy=http://127.0.0.1:7897 all_proxy=socks5://127.0.0.1:7897
npm ci
bundle install
cd ios
bundle exec pod install
```

打开 `ios/LxMusicMobile.xcworkspace`，选择 LxMusicMobile 和真机目标构建。
Xcode/SDK 必须能够构建 iOS 12.4；新版本 Xcode 对旧部署目标的支持需单独确认。

若使用了 `npm ci --ignore-scripts`，需要手动执行：

```sh
node scripts/prepare-source-dependencies.js
```

仅检查 iOS JavaScript 生产包：

```sh
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output /tmp/lx-ios12-main.jsbundle --assets-dest /tmp/lx-ios12-assets
```

React Native 降级同时影响 Android 依赖；本次目标为 iOS，Android 构建尚未验证。

## 本次验证结果

- `npm ci`：通过。
- iOS Release JavaScript bundle：通过，资源导出通过。
- 修改脚本的 ESLint、Podfile Ruby 语法及工程 plist 检查：通过。
- `pod install`：通过，生成了新的 `Podfile.lock` 和 workspace；64 个 pods。
- `tsc --noEmit`：未通过，业务源码中仍有隐式 any、Timer、泛型参数及可空 listId 等类型错误。本次没有改这些业务逻辑，也未将此检查标记为通过。
- arm64 Release 原生构建：被本机 Xcode 27 / iOS 27 SDK 拒绝，明确提示支持的部署目标范围为 15.0–27.0.x，无法构建 12.4。尚未完成原生编译，未生成 IPA。
- 尝试指定本机 Theos 目录的旧 SDK，Xcode 报告 SDK 无法定位；这不能替代一套支持 iOS 12.4 的完整 Xcode 工具链。
- 真机运行：尚未验证。需要合适的完整 Xcode 工具链继续编译，再检查启动、导入音源、播放、后台播放、锁屏控制及重启后数据保留。
