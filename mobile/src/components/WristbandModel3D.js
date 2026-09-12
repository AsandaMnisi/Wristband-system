import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { GLView } from "expo-gl";
import * as THREE from "three";
import { COLORS, FONTS } from "../constants/theme";

function getAiStatusColor(powerOn, connectionStatus, isAnomaly, bandRemoved) {
  if (!powerOn) return 0x000000;
  if (bandRemoved) return 0xaa00ff;
  if (isAnomaly) return 0xff2222;
  if (connectionStatus === 'connected') return 0x0088ff;
  if (connectionStatus === 'connecting') return 0x0088ff;
  return 0x000000;
}

export default function WristbandModel3D({
  vitals,
  shiftSteps = 0,
  isAnomaly = false,
  isSyncing = false,
  minerId = "MINER_001",
  lastSyncAt = null,
  connectionStatus = 'disconnected',
  bandRemoved = false,
  powerOn = false,
  onEmergencyPress,
}) {
  const mountRef = useRef(null);
  const rotControlRef = useRef({ setTargetAngle: null });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (Platform.OS !== 'web') return;

    const width = mount.clientWidth;
    const height = 520;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 5, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-4, -2, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x8899ff, 0.5);
    rim.position.set(-2, 3, -4);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0x404040, 0.6));

    const group = new THREE.Group();
    scene.add(group);

    const siliconeMat = new THREE.MeshStandardMaterial({
      color: 0xe8e0c8,
      roughness: 0.85,
      metalness: 0.05,
    });
    const caseMat = new THREE.MeshStandardMaterial({
      color: 0xf5f1e6,
      roughness: 0.4,
      metalness: 0.6,
    });
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.3,
      metalness: 0.1,
      emissive: 0x0a0a0a,
    });
    const rfidMat = new THREE.MeshBasicMaterial({ color: 0x378add });
    const sensorHousingMat = new THREE.MeshStandardMaterial({
      color: 0xf5f1e6,
      roughness: 0.35,
      metalness: 0.5,
    });
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.15,
      metalness: 0.2,
    });
    const ledGreenMat = new THREE.MeshStandardMaterial({
      color: 0x1ccf6a,
      emissive: 0x1ccf6a,
      emissiveIntensity: 1.4,
      roughness: 0.3,
    });

    const caseGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.34, 48);
    const caseMesh = new THREE.Mesh(caseGeo, caseMat);
    caseMesh.rotation.x = Math.PI / 2;
    group.add(caseMesh);

    const bezelGeo = new THREE.TorusGeometry(0.98, 0.05, 16, 48);
    const bezel = new THREE.Mesh(bezelGeo, caseMat);
    bezel.position.z = 0.17;
    group.add(bezel);

    const screenGeo = new THREE.CircleGeometry(0.82, 48);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.175;
    group.add(screen);

    function makeSquareOutline(size, thickness) {
      const shape = new THREE.Shape();
      const h = size / 2;
      shape.moveTo(-h, -h);
      shape.lineTo(h, -h);
      shape.lineTo(h, h);
      shape.lineTo(-h, h);
      shape.lineTo(-h, -h);
      const hole = new THREE.Path();
      const hi = h - thickness;
      hole.moveTo(-hi, -hi);
      hole.lineTo(hi, -hi);
      hole.lineTo(hi, hi);
      hole.lineTo(-hi, hi);
      hole.lineTo(-hi, -hi);
      shape.holes.push(hole);
      return new THREE.ShapeGeometry(shape);
    }
    const sq1 = new THREE.Mesh(makeSquareOutline(0.62, 0.06), rfidMat);
    sq1.position.z = 0.181;
    group.add(sq1);
    const sq2 = new THREE.Mesh(makeSquareOutline(0.38, 0.06), rfidMat);
    sq2.position.z = 0.182;
    group.add(sq2);
    const dotGeo = new THREE.BoxGeometry(0.14, 0.14, 0.01);
    const dot = new THREE.Mesh(dotGeo, rfidMat);
    dot.position.z = 0.183;
    group.add(dot);

    const sensorHousingGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.05, 32);
    const sensorHousing = new THREE.Mesh(sensorHousingGeo, sensorHousingMat);
    sensorHousing.rotation.x = Math.PI / 2;
    sensorHousing.position.z = -0.185;
    group.add(sensorHousing);

    const lensGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.03, 32);
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = -0.215;
    group.add(lens);

    const ledPositions = [
      [0.24, 0.1],
      [-0.24, 0.1],
      [0.16, -0.19],
      [-0.16, -0.19],
    ];
    ledPositions.forEach(([lx, ly]) => {
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), ledGreenMat);
      led.position.set(lx, ly, -0.208);
      group.add(led);
    });
    const sensorLight = new THREE.PointLight(0x1ccf6a, 0.6, 1.2);
    sensorLight.position.set(0, 0, -0.3);
    group.add(sensorLight);

    const buttonMat = new THREE.MeshStandardMaterial({
      color: 0xd4c8a8,
      roughness: 0.2,
      metalness: 0.8,
    });

    const btn1Geo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16);
    const btn1 = new THREE.Mesh(btn1Geo, buttonMat);
    btn1.rotation.z = Math.PI / 2;
    btn1.position.set(1.02, 0.15, 0);
    group.add(btn1);

    const btn2Geo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16);
    const btn2 = new THREE.Mesh(btn2Geo, buttonMat);
    btn2.rotation.z = Math.PI / 2;
    btn2.position.set(1.02, -0.25, 0);
    group.add(btn2);

    const chargingPortMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2d,
      roughness: 0.3,
      metalness: 0.9,
    });
    const portBodyGeo = new THREE.BoxGeometry(0.10, 0.04, 0.03);
    const portBody = new THREE.Mesh(portBodyGeo, chargingPortMat);
    portBody.position.set(1.02, -0.45, 0);
    group.add(portBody);

    const portInnerGeo = new THREE.BoxGeometry(0.06, 0.025, 0.02);
    const portInner = new THREE.Mesh(portInnerGeo, chargingPortMat);
    portInner.position.set(1.02, -0.45, 0.015);
    portInner.material.color.setHex(0x000000);
    group.add(portInner);

    function makeStrapCurve(direction) {
      const points = [];
      const segs = 20;
      for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const x = 0;
        const y = direction * (0.95 + t * 2.3);
        const z = direction * Math.sin(t * Math.PI * 0.55) * 0.9 * -1;
        points.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const shape = new THREE.Shape();
      shape.moveTo(-0.42, -0.06);
      shape.lineTo(0.42, -0.06);
      shape.lineTo(0.42, 0.06);
      shape.lineTo(-0.42, 0.06);
      shape.lineTo(-0.42, -0.06);
      const extrudeSettings = {
        steps: 40,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2,
        extrudePath: curve,
      };
      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }

    const strapTop = new THREE.Mesh(makeStrapCurve(1), siliconeMat);
    group.add(strapTop);
    const strapBottom = new THREE.Mesh(makeStrapCurve(-1), siliconeMat);
    group.add(strapBottom);

    const grooveMat = new THREE.MeshStandardMaterial({
      color: 0xd4c8a8,
      roughness: 0.9,
    });
    for (let i = 0; i < 5; i++) {
      const grooveTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.03, 0.02),
        grooveMat
      );
      grooveTop.position.set(0, 1.5 + i * 0.28, 0.35 - i * 0.12);
      grooveTop.rotation.x = -0.4;
      group.add(grooveTop);

      const grooveBottom = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.03, 0.02),
        grooveMat
      );
      grooveBottom.position.set(0, -(1.5 + i * 0.28), -(0.35 - i * 0.12));
      grooveBottom.rotation.x = 0.4;
      group.add(grooveBottom);
    }

    const aiStatusMat = new THREE.MeshBasicMaterial({ color: 0x0088ff });
    const aiGlowMat = new THREE.MeshBasicMaterial({ color: 0x0088ff, transparent: true, opacity: 0.25 });

    const aiCoreGeo = new THREE.CircleGeometry(0.055, 32);
    const aiCore = new THREE.Mesh(aiCoreGeo, aiStatusMat);
    aiCore.position.set(0.6, 0.48, 0.19);
    group.add(aiCore);

    const aiRingGeo = new THREE.RingGeometry(0.07, 0.09, 32);
    const aiRing = new THREE.Mesh(aiRingGeo, aiGlowMat);
    aiRing.position.set(0.6, 0.48, 0.19);
    group.add(aiRing);

    const aiHaloGeo = new THREE.RingGeometry(0.09, 0.12, 32);
    const aiHalo = new THREE.Mesh(aiHaloGeo, aiGlowMat);
    aiHalo.position.set(0.6, 0.48, 0.19);
    group.add(aiHalo);

    const aiPointLight = new THREE.PointLight(0x0088ff, 0.4, 0.6);
    aiPointLight.position.set(0.6, 0.48, 0.22);
    group.add(aiPointLight);

    group.rotation.x = -0.15;
    group.scale.setScalar(1.15);

    let frameId;
    let angle = 0.15;
    let targetAngle = 0.15;
    let targetRotX = -0.15;
    let currentRotX = -0.15;
    let dragging = false;
    let lastX = 0;
    let pulseTime = 0;

    rotControlRef.current.setTargetAngle = (newAngle, newRotX) => {
      if (newAngle !== undefined) targetAngle = newAngle;
      if (newRotX !== undefined) targetRotX = newRotX;
    };

    function onPointerDown(e) {
      dragging = true;
      lastX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const dx = x - lastX;
      lastX = x;
      angle += dx * 0.005;
      targetAngle = angle;
    }
    function onPointerUp() {
      dragging = false;
    }

    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    function animate() {
      pulseTime += 0.05;

      if (!dragging) {
        angle += (targetAngle - angle) * 0.06;
      }
      currentRotX += (targetRotX - currentRotX) * 0.06;

      group.rotation.y = angle;
      group.rotation.x = currentRotX;

      const statusHex = getAiStatusColor(powerOn, connectionStatus, isAnomaly, bandRemoved);

      const shouldBlink = powerOn && (connectionStatus === 'connecting' || bandRemoved);
      const blinkOn = shouldBlink ? (Math.sin(pulseTime * 4) > 0) : true;

      aiStatusMat.color.setHex(statusHex);
      aiGlowMat.color.setHex(statusHex);
      aiGlowMat.opacity = blinkOn ? (0.18 + (0.7 + Math.sin(pulseTime * 3) * 0.3) * 0.15) : 0;
      aiPointLight.color.setHex(statusHex);
      aiPointLight.intensity = blinkOn ? (0.35 + (0.7 + Math.sin(pulseTime * 3) * 0.3) * 0.25) : 0;

      aiCore.visible = powerOn;
      aiRing.visible = powerOn;
      aiHalo.visible = powerOn;
      aiPointLight.visible = powerOn;

      aiRing.scale.setScalar(1 + Math.sin(pulseTime * 2) * 0.08);
      aiHalo.scale.setScalar(1 + Math.cos(pulseTime * 2.3) * 0.1);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    function handleResize() {
      const w = mount.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [connectionStatus, isAnomaly, bandRemoved, powerOn]);

  const connColor = connectionStatus === 'connected' ? '#0088ff' : '#555555';
  const connLabel = connectionStatus === 'connected' ? 'AI LINK ACTIVE' : 'AI LINK IDLE';

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <div
          ref={mountRef}
          style={{
            width: "100%",
            height: "520px",
            touchAction: "none",
            display: powerOn ? 'block' : 'none',
          }}
        />
      ) : (
          <GLView
          ref={mountRef}
          style={{ width: "100%", height: 520 }}
          onContextCreate={() => {}}
        />
      )}

      {!powerOn && Platform.OS === 'web' && (
        <View style={styles.powerOverlay}>
          <Text style={styles.powerOverlayText}>WRISTBAND OFF</Text>
        </View>
      )}

      <View style={styles.controlsBar}>
        <View style={styles.quickAngleRow}>
          <TouchableOpacity
            style={styles.angleBtn}
            onPress={() => rotControlRef.current.setTargetAngle?.(0.15, -0.15)}
            activeOpacity={0.7}
          >
            <Text style={styles.angleBtnText}>⌚ FRONT VIEW</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.angleBtn}
            onPress={() => rotControlRef.current.setTargetAngle?.(Math.PI, 0.15)}
            activeOpacity={0.7}
          >
            <Text style={styles.angleBtnText}>🔬 REAR SENSORS</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hintText}>
          ↻ <Text style={{ color: COLORS.cyan }}>DRAG 360° TO ROTATE</Text> WITH MOUSE
        </Text>
      </View>

      <View style={styles.inlineStatus}>
        <View style={[styles.statusDot, { backgroundColor: connColor }]} />
        <Text style={[styles.statusText, { color: connColor }]}>{connLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  controlsBar: {
    alignItems: "center",
    marginTop: -18,
    marginBottom: 16,
    gap: 8,
  },
  quickAngleRow: {
    flexDirection: "row",
    gap: 10,
  },
  angleBtn: {
    backgroundColor: "#1b1d24",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2e323e",
  },
  angleBtnText: {
    fontFamily: FONTS.mono,
    fontSize: 9.5,
    color: "#9ca0b0",
    letterSpacing: 1,
    fontWeight: "700",
  },
  hintText: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: "#868a96",
    letterSpacing: 1,
    textAlign: "center",
  },
  inlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 18,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  statusText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
  },
  powerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  powerOverlayText: {
    fontFamily: FONTS.mono,
    fontSize: 14,
    color: '#666',
    letterSpacing: 2,
    fontWeight: '700',
  },
});
