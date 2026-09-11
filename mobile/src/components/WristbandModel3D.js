import React, { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { COLORS, FONTS } from "../constants/theme";

function getConnectionStatus(lastSyncAt, isSyncing) {
  if (!lastSyncAt) return "disconnected";
  const age = Date.now() - lastSyncAt.getTime();
  if (isSyncing || age < 8000) return "connected";
  if (age < 30000) return "idle";
  return "disconnected";
}

export default function WristbandModel3D({
  vitals,
  shiftSteps = 0,
  isAnomaly = false,
  isSyncing = false,
  minerId = "MINER_001",
  lastSyncAt = null,
  onEmergencyPress,
}) {
  const mountRef = useRef(null);
  const rotControlRef = useRef({ setTargetAngle: null });

  const connectionStatus = useMemo(
    () => getConnectionStatus(lastSyncAt, isSyncing),
    [lastSyncAt, isSyncing]
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      const mount = mountRef.current;
      if (!mount) return;

      const width = mount.clientWidth || 460;
      const height = 520;

      const scene = new THREE.Scene();
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
      camera.position.set(0, 0.4, 6.5);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      // Lighting
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(3, 5, 4);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.9);
      fill.position.set(-4, -2, 3);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0x8899ff, 0.8);
      rim.position.set(-2, 3, -4);
      scene.add(rim);
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));

      const group = new THREE.Group();
      scene.add(group);

      // Materials
      const siliconeMat = new THREE.MeshStandardMaterial({
        color: 0x4a4a4e,
        roughness: 0.85,
        metalness: 0.05,
      });
      const caseMat = new THREE.MeshStandardMaterial({
        color: 0x6a6a72,
        roughness: 0.4,
        metalness: 0.6,
      });
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.1,
        emissive: 0x222222,
      });
      const rfidMat = new THREE.MeshBasicMaterial({ color: 0x378add });
      const sensorHousingMat = new THREE.MeshStandardMaterial({
        color: 0x3a3a3e,
        roughness: 0.35,
        metalness: 0.5,
      });
      const lensMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.15,
        metalness: 0.2,
      });
      const ledGreenMat = new THREE.MeshStandardMaterial({
        color: 0x1ccf6a,
        emissive: 0x1ccf6a,
        emissiveIntensity: 1.4,
        roughness: 0.3,
      });

      // Watch case (cylinder facing camera)
      const caseGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.34, 48);
      const caseMesh = new THREE.Mesh(caseGeo, caseMat);
      caseMesh.rotation.x = Math.PI / 2;
      group.add(caseMesh);

      // Bezel ring
      const bezelGeo = new THREE.TorusGeometry(0.98, 0.05, 16, 48);
      const bezel = new THREE.Mesh(bezelGeo, caseMat);
      bezel.position.z = 0.17;
      group.add(bezel);

      // Screen
      const screenGeo = new THREE.CircleGeometry(0.82, 48);
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.175;
      group.add(screen);

      // RFID icon on screen: three nested square outlines
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

      // AI status light on screen - top right corner
      const aiStatusMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
      const aiGlowMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.25 });

      const aiCoreGeo = new THREE.CircleGeometry(0.055, 32);
      const aiCore = new THREE.Mesh(aiCoreGeo, aiStatusMat);
      aiCore.position.set(0.6, 0.48, 0.186);
      group.add(aiCore);

      const aiRingGeo = new THREE.RingGeometry(0.07, 0.09, 32);
      const aiRing = new THREE.Mesh(aiRingGeo, aiGlowMat);
      aiRing.position.set(0.6, 0.48, 0.186);
      group.add(aiRing);

      const aiHaloGeo = new THREE.RingGeometry(0.09, 0.12, 32);
      const aiHalo = new THREE.Mesh(aiHaloGeo, aiGlowMat);
      aiHalo.position.set(0.6, 0.48, 0.186);
      group.add(aiHalo);

      const aiPointLight = new THREE.PointLight(0x00ff88, 0.4, 0.6);
      aiPointLight.position.set(0.6, 0.48, 0.22);
      group.add(aiPointLight);

      // Sensor module — back of the case, sits flush against the skin
      const sensorHousingGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.05, 32);
      const sensorHousing = new THREE.Mesh(sensorHousingGeo, sensorHousingMat);
      sensorHousing.rotation.x = Math.PI / 2;
      sensorHousing.position.z = -0.185;
      group.add(sensorHousing);

      // Raised lens so the housing keeps contact with the wrist
      const lensGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.03, 32);
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.z = -0.215;
      group.add(lens);

      // Green LEDs around the lens — read heart rate, SpO2, temperature, steps
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

      // Side button
      const btnGeo = new THREE.BoxGeometry(0.06, 0.22, 0.1);
      const btn = new THREE.Mesh(btnGeo, caseMat);
      btn.position.set(1.02, 0.15, 0);
      group.add(btn);

      // Silicone straps (curved tubes) - top and bottom
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

      // Strap texture: subtle horizontal grooves via thin boxes
      const grooveMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a2e,
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

      group.rotation.x = -0.15;

      let frameId;
      let angle = 0.4;
      let dragging = false;
      let lastX = 0;
      let pulseTime = 0;

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

        if (!dragging) angle += 0.004;
        group.rotation.y = angle;

        const statusHex =
          connectionStatus === "connected"
            ? 0x00ff88
            : connectionStatus === "idle"
            ? 0xffaa00
            : 0xff3333;

        aiStatusMat.color.setHex(statusHex);
        aiGlowMat.color.setHex(statusHex);
        aiPointLight.color.setHex(statusHex);

        const pulse = 0.7 + Math.sin(pulseTime * 3) * 0.3;
        aiGlowMat.opacity = 0.18 + pulse * 0.15;
        aiRing.scale.setScalar(1 + Math.sin(pulseTime * 2) * 0.08);
        aiHalo.scale.setScalar(1 + Math.cos(pulseTime * 2.3) * 0.1);
        aiPointLight.intensity = 0.35 + pulse * 0.25;

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
    } else {
      const mount = mountRef.current;
      if (!mount || typeof mount.createView !== 'function') return;

      let frameId;
      let angle = 0.4;
      let pulseTime = 0;

      const { gl } = mount.createView();
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const camera = new THREE.PerspectiveCamera(35, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100);
      camera.position.set(0, 0.4, 6.5);

      const scene = new THREE.Scene();
      scene.background = null;

      const group = new THREE.Group();
      scene.add(group);

      // Lighting
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(3, 5, 4);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.9);
      fill.position.set(-4, -2, 3);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0x8899ff, 0.8);
      rim.position.set(-2, 3, -4);
      scene.add(rim);
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));

      // Materials
      const siliconeMat = new THREE.MeshStandardMaterial({
        color: 0x4a4a4e,
        roughness: 0.85,
        metalness: 0.05,
      });
      const caseMat = new THREE.MeshStandardMaterial({
        color: 0x6a6a72,
        roughness: 0.4,
        metalness: 0.6,
      });
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.1,
        emissive: 0x222222,
      });
      const rfidMat = new THREE.MeshBasicMaterial({ color: 0x378add });
      const sensorHousingMat = new THREE.MeshStandardMaterial({
        color: 0x3a3a3e,
        roughness: 0.35,
        metalness: 0.5,
      });
      const lensMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.15,
        metalness: 0.2,
      });
      const ledGreenMat = new THREE.MeshStandardMaterial({
        color: 0x1ccf6a,
        emissive: 0x1ccf6a,
        emissiveIntensity: 1.4,
        roughness: 0.3,
      });

      // Watch case
      const caseGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.34, 48);
      const caseMesh = new THREE.Mesh(caseGeo, caseMat);
      caseMesh.rotation.x = Math.PI / 2;
      group.add(caseMesh);

      // Bezel ring
      const bezelGeo = new THREE.TorusGeometry(0.98, 0.05, 16, 48);
      const bezel = new THREE.Mesh(bezelGeo, caseMat);
      bezel.position.z = 0.17;
      group.add(bezel);

      // Screen
      const screenGeo = new THREE.CircleGeometry(0.82, 48);
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.175;
      group.add(screen);

      // RFID icon on screen
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

      // AI status light on screen
      const aiStatusMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
      const aiGlowMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.25 });

      const aiCoreGeo = new THREE.CircleGeometry(0.055, 32);
      const aiCore = new THREE.Mesh(aiCoreGeo, aiStatusMat);
      aiCore.position.set(0.6, 0.48, 0.186);
      group.add(aiCore);

      const aiRingGeo = new THREE.RingGeometry(0.07, 0.09, 32);
      const aiRing = new THREE.Mesh(aiRingGeo, aiGlowMat);
      aiRing.position.set(0.6, 0.48, 0.186);
      group.add(aiRing);

      const aiHaloGeo = new THREE.RingGeometry(0.09, 0.12, 32);
      const aiHalo = new THREE.Mesh(aiHaloGeo, aiGlowMat);
      aiHalo.position.set(0.6, 0.48, 0.186);
      group.add(aiHalo);

      const aiPointLight = new THREE.PointLight(0x00ff88, 0.4, 0.6);
      aiPointLight.position.set(0.6, 0.48, 0.22);
      group.add(aiPointLight);

      // Sensor module
      const sensorHousingGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.05, 32);
      const sensorHousing = new THREE.Mesh(sensorHousingGeo, sensorHousingMat);
      sensorHousing.rotation.x = Math.PI / 2;
      sensorHousing.position.z = -0.185;
      group.add(sensorHousing);

      // Raised lens
      const lensGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.03, 32);
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.z = -0.215;
      group.add(lens);

      // Green LEDs
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

      // Side button
      const btnGeo = new THREE.BoxGeometry(0.06, 0.22, 0.1);
      const btn = new THREE.Mesh(btnGeo, caseMat);
      btn.position.set(1.02, 0.15, 0);
      group.add(btn);

      // Silicone straps
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

      // Strap texture
      const grooveMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a2e,
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

      group.rotation.x = -0.15;

      function animate() {
        pulseTime += 0.05;
        angle += 0.004;
        group.rotation.y = angle;

        const statusHex =
          connectionStatus === "connected"
            ? 0x00ff88
            : connectionStatus === "idle"
            ? 0xffaa00
            : 0xff3333;

        aiStatusMat.color.setHex(statusHex);
        aiGlowMat.color.setHex(statusHex);
        aiPointLight.color.setHex(statusHex);

        const pulse = 0.7 + Math.sin(pulseTime * 3) * 0.3;
        aiGlowMat.opacity = 0.18 + pulse * 0.15;
        aiRing.scale.setScalar(1 + Math.sin(pulseTime * 2) * 0.08);
        aiHalo.scale.setScalar(1 + Math.cos(pulseTime * 2.3) * 0.1);
        aiPointLight.intensity = 0.35 + pulse * 0.25;

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      }
      animate();

      return () => {
        cancelAnimationFrame(frameId);
        renderer.dispose();
      };
    }
  }, [onEmergencyPress, connectionStatus]);

  const connColor = connectionStatus === "connected" ? "#00ff88" : connectionStatus === "idle" ? "#FFA500" : "#ff3333";
  const connLabel = connectionStatus === "connected" ? "AI LINK ACTIVE" : connectionStatus === "idle" ? "AI LINK IDLE" : "AI LINK DOWN";

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <div
          ref={mountRef}
          style={{ width: "100%", height: "520px", touchAction: "none" }}
        />
      ) : (
        <GLView
          ref={mountRef}
          style={{ width: "100%", height: 520 }}
          onContextCreate={() => {}}
        />
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
});
