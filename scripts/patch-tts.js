// react-native-tts ships a 2016-era android/build.gradle that uses jcenter()
// (removed in Gradle 9) and AGP 1.3.1. This patch rewrites it after npm install.
// Root cause is fixed upstream nowhere — this must run on every fresh install.
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'react-native-tts', 'android', 'build.gradle');
if (!fs.existsSync(target)) {
  console.log('patch-tts: react-native-tts not installed, skipping');
  process.exit(0);
}

const original = fs.readFileSync(target, 'utf8');
if (!original.includes('buildscript {')) {
  console.log('patch-tts: already patched');
  process.exit(0);
}

const patched = `def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

// buildscript block removed: jcenter() no longer exists in Gradle 9, and the
// Android Gradle Plugin comes from the root project's classpath instead

apply plugin: 'com.android.library'

android {
    compileSdkVersion safeExtGet('compileSdkVersion', 36)

    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', 24)
        targetSdkVersion safeExtGet('targetSdkVersion', 36)
        versionCode 1
        versionName "1.0"
    }
}

repositories {
    mavenCentral()
    google()
}

dependencies {
    implementation 'com.facebook.react:react-native:+'
}
`;
fs.writeFileSync(target, patched);
console.log('patch-tts: patched react-native-tts/android/build.gradle (removed jcenter)');
