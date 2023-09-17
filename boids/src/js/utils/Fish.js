import * as THREE from "https://cdn.skypack.dev/three@0.131.3";
import {BufferGeometryUtils} from "https://cdn.skypack.dev/three@0.131.3/examples/jsm/utils/BufferGeometryUtils.js";

let simpleNoise = `
float N (vec2 st) { // https://thebookofshaders.com/10/
    return fract( sin( dot( st.xy, vec2(12.9898,78.233 ) ) ) *  43758.5453123);
}

float smoothNoise( vec2 ip ){ // https://www.youtube.com/watch?v=zXsWftRdsvU
    vec2 lv = fract( ip );
  vec2 id = floor( ip );
  
  lv = lv * lv * ( 3. - 2. * lv );
  
  float bl = N( id );
  float br = N( id + vec2( 1, 0 ));
  float b = mix( bl, br, lv.x );
  
  float tl = N( id + vec2( 0, 1 ));
  float tr = N( id + vec2( 1, 1 ));
  float t = mix( tl, tr, lv.x );
  
  return mix( b, t, lv.y );
}
`;

export const createFishMaterial = (color = 0x000000) => {
  let m = new THREE.MeshBasicMaterial({color: color, wireframe: false,})
    m.defines = {"USE_UV" : " "};
    m.userData = {
      uniforms: {
        totalLength: {value: 0}
      }
    }
    return m;
}
export const createFishGeometry = () => {
  
    const divisions = 20;
    let topCurve = new THREE.CatmullRomCurve3([[0, 0], [0.1, 0.15], [1, 0.75], [3.5, 1.5], [9, 0.5], [9.5, 0.45], [10, 0.55]].map(p => {return new THREE.Vector3(p[0], p[1], 0)}));
    let topPoints = topCurve.getSpacedPoints(100);
    let bottomCurve = new THREE.CatmullRomCurve3([[0, 0], [0.1, -0.15], [0.5, -0.35], [4.5, -1], [8, -0.6], [9.5, -0.45], [10, -0.55]].map(p => {return new THREE.Vector3(p[0], p[1], 0)}));
    let bottomPoints = bottomCurve.getSpacedPoints(100);
    let sideCurve = new THREE.CatmullRomCurve3([[0,   0, 0], [0.1, 0, 0.125], [1,   0, 0.375], [4,-0.25, 0.6], [8,   0, 0.25], [10,  0, 0.05]].map(p => {return new THREE.Vector3(p[0], p[1], p[2])}));
    let sidePoints = sideCurve.getSpacedPoints(100);
    let frames = computeFrames();
    let pts = [];
    let parts = [];
    frames.forEach(f => {
      f.forEach(p => {
        pts.push(p.x, p.y, p.z);
        parts.push(0);
      })
    })
    let tailCurve = new THREE.CatmullRomCurve3([[11,   -1.], [12.5, -1.5], [12., 0], [12.5, 1.5], [11,   1.]].map(p => {return new THREE.Vector3(p[0], p[1], p[2])}));
    let tailPoints = tailCurve.getPoints(divisions / 2);
    let tailPointsRev = tailPoints.map(p => {return p}).reverse();
    tailPointsRev.shift();
    let fullTailPoints = tailPoints.concat(tailPointsRev);
  
    let tailfinSlices = 5;
    let tailRatioStep = 1 / tailfinSlices;
    let vTemp = new THREE.Vector3();
    let tailPts = [];
    let tailParts = [];
    for(let i = 0; i <= tailfinSlices; i++){
      let ratio = i * tailRatioStep;
      frames[frames.length - 1].forEach( (p, idx) => {
        vTemp.lerpVectors(p, fullTailPoints[idx], ratio);
        tailPts.push(vTemp.x, vTemp.y, vTemp.z);
        tailParts.push(1);
      })
    }
    let gTail = new THREE.PlaneGeometry(1, 1, divisions, tailfinSlices);
    gTail.setAttribute("position", new THREE.Float32BufferAttribute(tailPts, 3));
    gTail.setAttribute("parts", new THREE.Float32BufferAttribute(tailParts, 1));
    gTail.computeVertexNormals();
    let dorsalCurve = new THREE.CatmullRomCurve3([[3, 1.45], [3.25, 2.25], [3.75, 3], [6, 2], [7, 1]].map(p => {return new THREE.Vector3(p[0], p[1], 0)}));
    let dorsalPoints = dorsalCurve.getSpacedPoints(100);
    let gDorsal = createFin(topPoints, dorsalPoints, true);
  
    // rect
    let rectCurve = new THREE.CatmullRomCurve3([[6, -0.9], [7.25, -1.5], [7.5, -0.75]].map(p => {return new THREE.Vector3(p[0], p[1], 0)}));
    let rectPoints = rectCurve.getSpacedPoints(40);
    let gRect = createFin(bottomPoints, rectPoints, false);
  
    // pelvic
    let pelvicCurve = new THREE.CatmullRomCurve3([[2.25, -0.7], [3.75, -2], [4, -1]].map(p => {return new THREE.Vector3(p[0], p[1], 0)}));
    let pelvicPoints = pelvicCurve.getSpacedPoints(40);
  
    let gPelvic = createFin(bottomPoints, pelvicPoints, false);
    gPelvic.translate(0, 0.6, 0);
    let gPelvicL = gPelvic.clone();
    gPelvicL.rotateX(THREE.MathUtils.degToRad(-20));
    gPelvicL.translate(0, -0.6, 0);
    let gPelvicR = gPelvic.clone();
    gPelvicR.rotateX(THREE.MathUtils.degToRad(20));
    gPelvicR.translate(0, -0.6, 0);
  
    let bodyGeom = new THREE.PlaneGeometry(1, 1, divisions, frames.length - 1);
    bodyGeom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    bodyGeom.setAttribute("parts", new THREE.Float32BufferAttribute(parts, 1));
    bodyGeom.computeVertexNormals();
    let mainGeom = BufferGeometryUtils.mergeBufferGeometries([bodyGeom, gTail, gDorsal, gRect, gPelvicL, gPelvicR])
    return mainGeom;
  
    function createFin(basePoints, contourPoints, isTop){
      let basePts = [];
      let shift = 0.05;
      let shiftSign = isTop ? 1 : -1;
      let vAdd = new THREE.Vector3(0, -shift * shiftSign, 0);
  
      contourPoints.forEach((p, idx) => {
        basePts.push(getPoint(basePoints, p.x).add(vAdd));
      });
  
      let basePtsRev = basePts.map(p => {return p.clone()}).reverse();
      basePtsRev.shift();
  
      let contourPointsRev = contourPoints.map(p => {return p.clone()}).reverse();
      contourPointsRev.shift();
  
      basePts.forEach((p, idx, arr) => {
        if (idx > 0 && idx < arr.length - 1) p.setZ(shift * shiftSign)
      });
      basePtsRev.forEach((p, idx, arr) => {
        if (idx < arr.length - 1) p.setZ(-shift * shiftSign)
      });
  
      let fullPoints = [];
      fullPoints = fullPoints.concat(contourPoints, contourPointsRev, basePts, basePtsRev);
  
      let ps = [];
      let parts = [];
      fullPoints.forEach(p => {
        ps.push(p.x, p.y, p.z);
        parts.push(1);
      });
  
      let plane = new THREE.PlaneGeometry(1, 1, (contourPoints.length-1) * 2, 1);
      plane.setAttribute("position", new THREE.Float32BufferAttribute(ps, 3));
      plane.setAttribute("parts", new THREE.Float32BufferAttribute(parts, 1));
      plane.computeVertexNormals();
      return plane;
    }
  
    function computeFrames(){
      let frames = [];
      let step = 0.05;
      frames.push(new Array(divisions + 1).fill(0).map(p => {return new THREE.Vector3()}));
      for(let i = step; i < 10; i += step){
        frames.push(getFrame(i));
      }
      frames.push(getFramePoints(topPoints[100], bottomPoints[100], sidePoints[100]));
      return frames;
    }
  
    function getFrame(x){
      let top = getPoint(topPoints, x);
      let bottom = getPoint(bottomPoints, x);
      let side = getPoint(sidePoints, x);
      return getFramePoints(top, bottom, side);
    }
  
    function getFramePoints(top, bottom, side){
      let sideR = side;
      let sideL = sideR.clone().setZ(sideR.z * -1);
      let baseCurve = new THREE.CatmullRomCurve3([
        bottom,
        sideR,
        top,
        sideL
      ], true);
  
      let framePoints = baseCurve.getSpacedPoints(divisions);
      return framePoints;
    }
  
    function getPoint(curvePoints, x){
      let v = new THREE.Vector3();
      for(let i = 0; i < curvePoints.length - 1; i++){
        let i1 = curvePoints[i];
        let i2 = curvePoints[i+1];
        if (x >= i1.x && x <= i2.x){
          let a = (x - i1.x) / (i2.x - i1.x);
          return v.lerpVectors(i1, i2, a);
        }
      }
    }
}