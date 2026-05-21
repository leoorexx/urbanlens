import{i as e,n as t}from"./index-CN292B_Q.js";import{C as n,S as r,T as i,a,b as o,f as s,g as c,h as l,i as u,m as d,n as f,o as p,p as m,v as h,w as g,x as _,y as v}from"./dist-CEPlxmmF.js";var y=class extends s{constructor(e={}){let{id:t=d(`cube-geometry`),indices:n=!0}=e;super(n?{...e,id:t,topology:`triangle-list`,indices:{size:1,value:b},attributes:{...D,...e.attributes}}:{...e,id:t,topology:`triangle-list`,indices:void 0,attributes:{...O,...e.attributes}})}},b=new Uint16Array([0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23]),x=new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1]),S=new Float32Array([0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0]),C=new Float32Array([0,0,1,0,1,1,0,1,1,0,1,1,0,1,0,0,0,1,0,0,1,0,1,1,1,1,0,1,0,0,1,0,1,0,1,1,0,1,0,0,0,0,1,0,1,1,0,1]),w=new Float32Array([1,-1,1,-1,-1,1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,-1,1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,-1,-1,1,1,1,1,1,1,1,-1,-1,1,-1,-1,1,1,1,1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1,-1,1,-1,1,-1,1,1,1,-1,1,1,-1,-1,1,-1,-1,1,1,-1,1,1,1,1,1,-1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1]),T=new Float32Array([1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,0,0,1,0,1,1,1,1,0,1,0,0,1,0,1,1,0,0]),E=new Float32Array([1,0,1,1,0,0,1,1,0,0,0,1,1,0,0,1,1,0,1,1,0,0,0,1,1,1,1,1,1,0,1,1,1,0,0,1,1,1,0,1,1,1,1,1,1,0,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,0,1,1,0,1,1,1,0,1,0,1,0,0,0,1,0,0,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1,1,1,1,1,1,1,0,0,1,0,0,0,1,0,1,0,1,1,1,0,1,1,0,0,1,0,1,0,1]),D={POSITION:{size:3,value:x},NORMAL:{size:3,value:S},TEXCOORD_0:{size:2,value:C}},O={POSITION:{size:3,value:w},TEXCOORD_0:{size:2,value:T},COLOR_0:{size:3,value:E}},k=`layout(std140) uniform arcUniforms {
  bool greatCircle;
  bool useShortestPath;
  float numSegments;
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  highp int widthUnits;
} arc;
`,A={name:`arc`,vs:k,fs:k,uniformTypes:{greatCircle:`f32`,useShortestPath:`f32`,numSegments:`f32`,widthScale:`f32`,widthMinPixels:`f32`,widthMaxPixels:`f32`,widthUnits:`i32`}},j=`#version 300 es
#define SHADER_NAME arc-layer-vertex-shader
in vec4 instanceSourceColors;
in vec4 instanceTargetColors;
in vec3 instanceSourcePositions;
in vec3 instanceSourcePositions64Low;
in vec3 instanceTargetPositions;
in vec3 instanceTargetPositions64Low;
in vec3 instancePickingColors;
in float instanceWidths;
in float instanceHeights;
in float instanceTilts;
out vec4 vColor;
out vec2 uv;
out float isValid;
float paraboloid(float distance, float sourceZ, float targetZ, float ratio) {
float deltaZ = targetZ - sourceZ;
float dh = distance * instanceHeights;
if (dh == 0.0) {
return sourceZ + deltaZ * ratio;
}
float unitZ = deltaZ / dh;
float p2 = unitZ * unitZ + 1.0;
float dir = step(deltaZ, 0.0);
float z0 = mix(sourceZ, targetZ, dir);
float r = mix(ratio, 1.0 - ratio, dir);
return sqrt(r * (p2 - r)) * dh + z0;
}
vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction, float width) {
vec2 dir_screenspace = normalize(line_clipspace * project.viewportSize);
dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);
return dir_screenspace * offset_direction * width / 2.0;
}
float getSegmentRatio(float index) {
return smoothstep(0.0, 1.0, index / (arc.numSegments - 1.0));
}
vec3 interpolateFlat(vec3 source, vec3 target, float segmentRatio) {
float distance = length(source.xy - target.xy);
float z = paraboloid(distance, source.z, target.z, segmentRatio);
float tiltAngle = radians(instanceTilts);
vec2 tiltDirection = normalize(target.xy - source.xy);
vec2 tilt = vec2(-tiltDirection.y, tiltDirection.x) * z * sin(tiltAngle);
return vec3(
mix(source.xy, target.xy, segmentRatio) + tilt,
z * cos(tiltAngle)
);
}
float getAngularDist (vec2 source, vec2 target) {
vec2 sourceRadians = radians(source);
vec2 targetRadians = radians(target);
vec2 sin_half_delta = sin((sourceRadians - targetRadians) / 2.0);
vec2 shd_sq = sin_half_delta * sin_half_delta;
float a = shd_sq.y + cos(sourceRadians.y) * cos(targetRadians.y) * shd_sq.x;
return 2.0 * asin(sqrt(a));
}
vec3 interpolateGreatCircle(vec3 source, vec3 target, vec3 source3D, vec3 target3D, float angularDist, float t) {
vec2 lngLat;
if(abs(angularDist - PI) < 0.001) {
lngLat = (1.0 - t) * source.xy + t * target.xy;
} else {
float a = sin((1.0 - t) * angularDist);
float b = sin(t * angularDist);
vec3 p = source3D.yxz * a + target3D.yxz * b;
lngLat = degrees(vec2(atan(p.y, -p.x), atan(p.z, length(p.xy))));
}
float z = paraboloid(angularDist * EARTH_RADIUS, source.z, target.z, t);
return vec3(lngLat, z);
}
void main(void) {
geometry.worldPosition = instanceSourcePositions;
geometry.worldPositionAlt = instanceTargetPositions;
float segmentIndex = float(gl_VertexID / 2);
float segmentSide = mod(float(gl_VertexID), 2.) == 0. ? -1. : 1.;
float segmentRatio = getSegmentRatio(segmentIndex);
float prevSegmentRatio = getSegmentRatio(max(0.0, segmentIndex - 1.0));
float nextSegmentRatio = getSegmentRatio(min(arc.numSegments - 1.0, segmentIndex + 1.0));
float indexDir = mix(-1.0, 1.0, step(segmentIndex, 0.0));
isValid = 1.0;
uv = vec2(segmentRatio, segmentSide);
geometry.uv = uv;
geometry.pickingColor = instancePickingColors;
vec4 curr;
vec4 next;
vec3 source;
vec3 target;
if ((arc.greatCircle || project.projectionMode == PROJECTION_MODE_GLOBE) && project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
source = project_globe_(vec3(instanceSourcePositions.xy, 0.0));
target = project_globe_(vec3(instanceTargetPositions.xy, 0.0));
float angularDist = getAngularDist(instanceSourcePositions.xy, instanceTargetPositions.xy);
vec3 prevPos = interpolateGreatCircle(instanceSourcePositions, instanceTargetPositions, source, target, angularDist, prevSegmentRatio);
vec3 currPos = interpolateGreatCircle(instanceSourcePositions, instanceTargetPositions, source, target, angularDist, segmentRatio);
vec3 nextPos = interpolateGreatCircle(instanceSourcePositions, instanceTargetPositions, source, target, angularDist, nextSegmentRatio);
if (abs(currPos.x - prevPos.x) > 180.0) {
indexDir = -1.0;
isValid = 0.0;
} else if (abs(currPos.x - nextPos.x) > 180.0) {
indexDir = 1.0;
isValid = 0.0;
}
nextPos = indexDir < 0.0 ? prevPos : nextPos;
nextSegmentRatio = indexDir < 0.0 ? prevSegmentRatio : nextSegmentRatio;
if (isValid == 0.0) {
nextPos.x += nextPos.x > 0.0 ? -360.0 : 360.0;
float t = ((currPos.x > 0.0 ? 180.0 : -180.0) - currPos.x) / (nextPos.x - currPos.x);
currPos = mix(currPos, nextPos, t);
segmentRatio = mix(segmentRatio, nextSegmentRatio, t);
}
vec3 currPos64Low = mix(instanceSourcePositions64Low, instanceTargetPositions64Low, segmentRatio);
vec3 nextPos64Low = mix(instanceSourcePositions64Low, instanceTargetPositions64Low, nextSegmentRatio);
curr = project_position_to_clipspace(currPos, currPos64Low, vec3(0.0), geometry.position);
next = project_position_to_clipspace(nextPos, nextPos64Low, vec3(0.0));
} else {
vec3 source_world = instanceSourcePositions;
vec3 target_world = instanceTargetPositions;
if (arc.useShortestPath) {
source_world.x = mod(source_world.x + 180., 360.0) - 180.;
target_world.x = mod(target_world.x + 180., 360.0) - 180.;
float deltaLng = target_world.x - source_world.x;
if (deltaLng > 180.) target_world.x -= 360.;
if (deltaLng < -180.) source_world.x -= 360.;
}
source = project_position(source_world, instanceSourcePositions64Low);
target = project_position(target_world, instanceTargetPositions64Low);
float antiMeridianX = 0.0;
if (arc.useShortestPath) {
if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
antiMeridianX = -(project.coordinateOrigin.x + 180.) / 360. * TILE_SIZE;
}
float thresholdRatio = (antiMeridianX - source.x) / (target.x - source.x);
if (prevSegmentRatio <= thresholdRatio && nextSegmentRatio > thresholdRatio) {
isValid = 0.0;
indexDir = sign(segmentRatio - thresholdRatio);
segmentRatio = thresholdRatio;
}
}
nextSegmentRatio = indexDir < 0.0 ? prevSegmentRatio : nextSegmentRatio;
vec3 currPos = interpolateFlat(source, target, segmentRatio);
vec3 nextPos = interpolateFlat(source, target, nextSegmentRatio);
if (arc.useShortestPath) {
if (nextPos.x < antiMeridianX) {
currPos.x += TILE_SIZE;
nextPos.x += TILE_SIZE;
}
}
curr = project_common_position_to_clipspace(vec4(currPos, 1.0));
next = project_common_position_to_clipspace(vec4(nextPos, 1.0));
geometry.position = vec4(currPos, 1.0);
}
float widthPixels = clamp(
project_size_to_pixel(instanceWidths * arc.widthScale, arc.widthUnits),
arc.widthMinPixels, arc.widthMaxPixels
);
vec3 offset = vec3(
getExtrusionOffset((next.xy - curr.xy) * indexDir, segmentSide, widthPixels),
0.0);
DECKGL_FILTER_SIZE(offset, geometry);
DECKGL_FILTER_GL_POSITION(curr, geometry);
gl_Position = curr + vec4(project_pixel_size_to_clipspace(offset.xy), 0.0, 0.0);
vec4 color = mix(instanceSourceColors, instanceTargetColors, segmentRatio);
vColor = vec4(color.rgb, color.a * layer.opacity);
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,M=`#version 300 es
#define SHADER_NAME arc-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 uv;
in float isValid;
out vec4 fragColor;
void main(void) {
if (isValid == 0.0) {
discard;
}
fragColor = vColor;
geometry.uv = uv;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,N=[0,0,0,255],ee={getSourcePosition:{type:`accessor`,value:e=>e.sourcePosition},getTargetPosition:{type:`accessor`,value:e=>e.targetPosition},getSourceColor:{type:`accessor`,value:N},getTargetColor:{type:`accessor`,value:N},getWidth:{type:`accessor`,value:1},getHeight:{type:`accessor`,value:1},getTilt:{type:`accessor`,value:0},greatCircle:!1,numSegments:{type:`number`,value:50,min:1},widthUnits:`pixels`,widthScale:{type:`number`,value:1,min:0},widthMinPixels:{type:`number`,value:0,min:0},widthMaxPixels:{type:`number`,value:2**53-1,min:0}},P=class extends a{getBounds(){return this.getAttributeManager()?.getBounds([`instanceSourcePositions`,`instanceTargetPositions`])}getShaders(){return super.getShaders({vs:j,fs:M,modules:[h,l,A]})}get wrapLongitude(){return!1}initializeState(){this.getAttributeManager().addInstanced({instanceSourcePositions:{size:3,type:`float64`,fp64:this.use64bitPositions(),transition:!0,accessor:`getSourcePosition`},instanceTargetPositions:{size:3,type:`float64`,fp64:this.use64bitPositions(),transition:!0,accessor:`getTargetPosition`},instanceSourceColors:{size:this.props.colorFormat.length,type:`unorm8`,transition:!0,accessor:`getSourceColor`,defaultValue:N},instanceTargetColors:{size:this.props.colorFormat.length,type:`unorm8`,transition:!0,accessor:`getTargetColor`,defaultValue:N},instanceWidths:{size:1,transition:!0,accessor:`getWidth`,defaultValue:1},instanceHeights:{size:1,transition:!0,accessor:`getHeight`,defaultValue:1},instanceTilts:{size:1,transition:!0,accessor:`getTilt`,defaultValue:0}})}updateState(e){super.updateState(e),e.changeFlags.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:e}){let{widthUnits:t,widthScale:n,widthMinPixels:r,widthMaxPixels:i,greatCircle:a,wrapLongitude:o,numSegments:s}=this.props,c={numSegments:s,widthUnits:v[t],widthScale:n,widthMinPixels:r,widthMaxPixels:i,greatCircle:a,useShortestPath:o},l=this.state.model;l.shaderInputs.setProps({arc:c}),l.setVertexCount(s*2),l.draw(this.context.renderPass)}_getModel(){return new m(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),topology:`triangle-strip`,isInstanced:!0})}};P.layerName=`ArcLayer`,P.defaultProps=ee;var te=new Uint32Array([0,2,1,0,3,2]),ne=new Float32Array([0,1,0,0,1,0,1,1]);function re(e,t){if(!t)return ie(e);let n=Math.max(Math.abs(e[0][0]-e[3][0]),Math.abs(e[1][0]-e[2][0])),r=Math.max(Math.abs(e[1][1]-e[0][1]),Math.abs(e[2][1]-e[3][1])),i=Math.ceil(n/t)+1,a=Math.ceil(r/t)+1,o=(i-1)*(a-1)*6,s=new Uint32Array(o),c=new Float32Array(i*a*2),l=new Float64Array(i*a*3),u=0,d=0;for(let t=0;t<i;t++){let n=t/(i-1);for(let r=0;r<a;r++){let i=r/(a-1),o=ae(e,n,i);l[u*3+0]=o[0],l[u*3+1]=o[1],l[u*3+2]=o[2]||0,c[u*2+0]=n,c[u*2+1]=1-i,t>0&&r>0&&(s[d++]=u-a,s[d++]=u-a-1,s[d++]=u-1,s[d++]=u-a,s[d++]=u-1,s[d++]=u),u++}}return{vertexCount:o,positions:l,indices:s,texCoords:c}}function ie(e){let t=new Float64Array(12);for(let n=0;n<e.length;n++)t[n*3+0]=e[n][0],t[n*3+1]=e[n][1],t[n*3+2]=e[n][2]||0;return{vertexCount:6,positions:t,indices:te,texCoords:ne}}function ae(e,t,r){return n(n(e[0],e[1],r),n(e[3],e[2],r),t)}var oe=`layout(std140) uniform bitmapUniforms {
  vec4 bounds;
  float coordinateConversion;
  float desaturate;
  vec3 tintColor;
  vec4 transparentColor;
} bitmap;
`,se={name:`bitmap`,vs:oe,fs:oe,uniformTypes:{bounds:`vec4<f32>`,coordinateConversion:`f32`,desaturate:`f32`,tintColor:`vec3<f32>`,transparentColor:`vec4<f32>`}},ce=`#version 300 es
#define SHADER_NAME bitmap-layer-vertex-shader

in vec2 texCoords;
in vec3 positions;
in vec3 positions64Low;

out vec2 vTexCoord;
out vec2 vTexPos;

const vec3 pickingColor = vec3(1.0, 0.0, 0.0);

void main(void) {
  geometry.worldPosition = positions;
  geometry.uv = texCoords;
  geometry.pickingColor = pickingColor;

  gl_Position = project_position_to_clipspace(positions, positions64Low, vec3(0.0), geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vTexCoord = texCoords;

  if (bitmap.coordinateConversion < -0.5) {
    vTexPos = geometry.position.xy + project.commonOrigin.xy;
  } else if (bitmap.coordinateConversion > 0.5) {
    vTexPos = geometry.worldPosition.xy;
  }

  vec4 color = vec4(0.0);
  DECKGL_FILTER_COLOR(color, geometry);
}
`,le=`#version 300 es
#define SHADER_NAME bitmap-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D bitmapTexture;

in vec2 vTexCoord;
in vec2 vTexPos;

out vec4 fragColor;

/* projection utils */
const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / PI / 2.0;

// from degrees to Web Mercator
vec2 lnglat_to_mercator(vec2 lnglat) {
  float x = lnglat.x;
  float y = clamp(lnglat.y, -89.9, 89.9);
  return vec2(
    radians(x) + PI,
    PI + log(tan(PI * 0.25 + radians(y) * 0.5))
  ) * WORLD_SCALE;
}

// from Web Mercator to degrees
vec2 mercator_to_lnglat(vec2 xy) {
  xy /= WORLD_SCALE;
  return degrees(vec2(
    xy.x - PI,
    atan(exp(xy.y - PI)) * 2.0 - PI * 0.5
  ));
}
/* End projection utils */

// apply desaturation
vec3 color_desaturate(vec3 color) {
  float luminance = (color.r + color.g + color.b) * 0.333333333;
  return mix(color, vec3(luminance), bitmap.desaturate);
}

// apply tint
vec3 color_tint(vec3 color) {
  return color * bitmap.tintColor;
}

// blend with background color
vec4 apply_opacity(vec3 color, float alpha) {
  if (bitmap.transparentColor.a == 0.0) {
    return vec4(color, alpha);
  }
  float blendedAlpha = alpha + bitmap.transparentColor.a * (1.0 - alpha);
  float highLightRatio = alpha / blendedAlpha;
  vec3 blendedRGB = mix(bitmap.transparentColor.rgb, color, highLightRatio);
  return vec4(blendedRGB, blendedAlpha);
}

vec2 getUV(vec2 pos) {
  return vec2(
    (pos.x - bitmap.bounds[0]) / (bitmap.bounds[2] - bitmap.bounds[0]),
    (pos.y - bitmap.bounds[3]) / (bitmap.bounds[1] - bitmap.bounds[3])
  );
}


vec3 packUVsIntoRGB(vec2 uv) {
  // Extract the top 8 bits. We want values to be truncated down so we can add a fraction
  vec2 uv8bit = floor(uv * 256.);

  // Calculate the normalized remainders of u and v parts that do not fit into 8 bits
  // Scale and clamp to 0-1 range
  vec2 uvFraction = fract(uv * 256.);
  vec2 uvFraction4bit = floor(uvFraction * 16.);

  // Remainder can be encoded in blue channel, encode as 4 bits for pixel coordinates
  float fractions = uvFraction4bit.x + uvFraction4bit.y * 16.;

  return vec3(uv8bit, fractions) / 255.;
}


void main(void) {
  vec2 uv = vTexCoord;
  if (bitmap.coordinateConversion < -0.5) {
    vec2 lnglat = mercator_to_lnglat(vTexPos);
    uv = getUV(lnglat);
  } else if (bitmap.coordinateConversion > 0.5) {
    vec2 commonPos = lnglat_to_mercator(vTexPos);
    uv = getUV(commonPos);
  }
  vec4 bitmapColor = texture(bitmapTexture, uv);

  fragColor = apply_opacity(color_tint(color_desaturate(bitmapColor.rgb)), bitmapColor.a * layer.opacity);

  geometry.uv = uv;
  DECKGL_FILTER_COLOR(fragColor, geometry);

  if (bool(picking.isActive) && !bool(picking.isAttribute)) {
    // Since instance information is not used, we can use picking color for pixel index
    fragColor.rgb = packUVsIntoRGB(uv);
  }
}
`,ue={image:{type:`image`,value:null,async:!0},bounds:{type:`array`,value:[1,0,0,1],compare:!0},_imageCoordinateSystem:`default`,desaturate:{type:`number`,min:0,max:1,value:0},transparentColor:{type:`color`,value:[0,0,0,0]},tintColor:{type:`color`,value:[255,255,255]},textureParameters:{type:`object`,ignore:!0,value:null}},de=class extends a{getShaders(){return super.getShaders({vs:ce,fs:le,modules:[h,l,se]})}initializeState(){let e=this.getAttributeManager();e.remove([`instancePickingColors`]),e.add({indices:{size:1,isIndexed:!0,update:e=>e.value=this.state.mesh.indices,noAlloc:!0},positions:{size:3,type:`float64`,fp64:this.use64bitPositions(),update:e=>e.value=this.state.mesh.positions,noAlloc:!0},texCoords:{size:2,update:e=>e.value=this.state.mesh.texCoords,noAlloc:!0}})}updateState({props:e,oldProps:t,changeFlags:n}){let r=this.getAttributeManager();if(n.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),r.invalidateAll()),e.bounds!==t.bounds){let e=this.state.mesh,t=this._createMesh();this.state.model.setVertexCount(t.vertexCount);for(let n in t)e&&e[n]!==t[n]&&r.invalidate(n);this.setState({mesh:t,...this._getCoordinateUniforms()})}else e._imageCoordinateSystem!==t._imageCoordinateSystem&&this.setState(this._getCoordinateUniforms())}getPickingInfo(e){let{image:t}=this.props,n=e.info;if(!n.color||!t)return n.bitmap=null,n;let{width:r,height:i}=t;n.index=0;let a=fe(n.color);return n.bitmap={size:{width:r,height:i},uv:a,pixel:[Math.floor(a[0]*r),Math.floor(a[1]*i)]},n}disablePickingIndex(){this.setState({disablePicking:!0})}restorePickingColors(){this.setState({disablePicking:!1})}_updateAutoHighlight(e){super._updateAutoHighlight({...e,color:this.encodePickingColor(0)})}_createMesh(){let{bounds:e}=this.props,t=e;return pe(e)&&(t=[[e[0],e[1]],[e[0],e[3]],[e[2],e[3]],[e[2],e[1]]]),re(t,this.context.viewport.resolution)}_getModel(){return new m(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),topology:`triangle-list`,isInstanced:!1})}draw(e){let{shaderModuleProps:t}=e,{model:n,coordinateConversion:r,bounds:i,disablePicking:a}=this.state,{image:o,desaturate:s,transparentColor:c,tintColor:l}=this.props;if(!(t.picking.isActive&&a)&&o&&n){let e={bitmapTexture:o,bounds:i,coordinateConversion:r,desaturate:s,tintColor:l.slice(0,3).map(e=>e/255),transparentColor:c.map(e=>e/255)};n.shaderInputs.setProps({bitmap:e}),n.draw(this.context.renderPass)}}_getCoordinateUniforms(){let{_imageCoordinateSystem:e}=this.props;if(e!==`default`){let{bounds:t}=this.props;if(!pe(t))throw Error(`_imageCoordinateSystem only supports rectangular bounds`);let n=this.context.viewport.resolution?`lnglat`:`cartesian`;if(e=e===`lnglat`?`lnglat`:`cartesian`,e===`lnglat`&&n===`cartesian`)return{coordinateConversion:-1,bounds:t};if(e===`cartesian`&&n===`lnglat`){let e=c([t[0],t[1]]),n=c([t[2],t[3]]);return{coordinateConversion:1,bounds:[e[0],e[1],n[0],n[1]]}}}return{coordinateConversion:0,bounds:[0,0,0,0]}}};de.layerName=`BitmapLayer`,de.defaultProps=ue;function fe(e){let[t,n,r]=e,i=(r&240)/256;return[(t+(r&15)/16)/256,(n+i)/256]}function pe(e){return Number.isFinite(e[0])}var me=`layout(std140) uniform iconUniforms {
  float sizeScale;
  vec2 iconsTextureDim;
  float sizeBasis;
  float sizeMinPixels;
  float sizeMaxPixels;
  bool billboard;
  highp int sizeUnits;
  float alphaCutoff;
} icon;
`,he={name:`icon`,vs:me,fs:me,uniformTypes:{sizeScale:`f32`,iconsTextureDim:`vec2<f32>`,sizeBasis:`f32`,sizeMinPixels:`f32`,sizeMaxPixels:`f32`,billboard:`f32`,sizeUnits:`i32`,alphaCutoff:`f32`}},ge=`#version 300 es
#define SHADER_NAME icon-layer-vertex-shader
in vec2 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceSizes;
in float instanceAngles;
in vec4 instanceColors;
in vec3 instancePickingColors;
in vec4 instanceIconFrames;
in float instanceColorModes;
in vec2 instanceOffsets;
in vec2 instancePixelOffset;
out float vColorMode;
out vec4 vColor;
out vec2 vTextureCoords;
out vec2 uv;
vec2 rotate_by_angle(vec2 vertex, float angle) {
float angle_radian = angle * PI / 180.0;
float cos_angle = cos(angle_radian);
float sin_angle = sin(angle_radian);
mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
return rotationMatrix * vertex;
}
void main(void) {
geometry.worldPosition = instancePositions;
geometry.uv = positions;
geometry.pickingColor = instancePickingColors;
uv = positions;
vec2 iconSize = instanceIconFrames.zw;
float sizePixels = clamp(
project_size_to_pixel(instanceSizes * icon.sizeScale, icon.sizeUnits),
icon.sizeMinPixels, icon.sizeMaxPixels
);
float iconConstraint = icon.sizeBasis == 0.0 ? iconSize.x : iconSize.y;
float instanceScale = iconConstraint == 0.0 ? 0.0 : sizePixels / iconConstraint;
vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;
pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;
pixelOffset += instancePixelOffset;
pixelOffset.y *= -1.0;
if (icon.billboard)  {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = vec3(pixelOffset, 0.0);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
DECKGL_FILTER_SIZE(offset_common, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vTextureCoords = mix(
instanceIconFrames.xy,
instanceIconFrames.xy + iconSize,
(positions.xy + 1.0) / 2.0
) / icon.iconsTextureDim;
vColor = instanceColors;
DECKGL_FILTER_COLOR(vColor, geometry);
vColorMode = instanceColorModes;
}
`,_e=`#version 300 es
#define SHADER_NAME icon-layer-fragment-shader
precision highp float;
uniform sampler2D iconsTexture;
in float vColorMode;
in vec4 vColor;
in vec2 vTextureCoords;
in vec2 uv;
out vec4 fragColor;
void main(void) {
geometry.uv = uv;
vec4 texColor = texture(iconsTexture, vTextureCoords);
vec3 color = mix(texColor.rgb, vColor.rgb, vColorMode);
float a = texColor.a * layer.opacity * vColor.a;
if (a < icon.alphaCutoff) {
discard;
}
fragColor = vec4(color, a);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,ve=`struct IconUniforms {
  sizeScale: f32,
  iconsTextureDim: vec2<f32>,
  sizeBasis: f32,
  sizeMinPixels: f32,
  sizeMaxPixels: f32,
  billboard: i32,
  sizeUnits: i32,
  alphaCutoff: f32
};

@group(0) @binding(auto) var<uniform> icon: IconUniforms;
@group(0) @binding(auto) var iconsTexture : texture_2d<f32>;
@group(0) @binding(auto) var iconsTextureSampler : sampler;

fn rotate_by_angle(vertex: vec2<f32>, angle_deg: f32) -> vec2<f32> {
  let angle_radian = angle_deg * PI / 180.0;
  let c = cos(angle_radian);
  let s = sin(angle_radian);
  let rotation = mat2x2<f32>(vec2<f32>(c, s), vec2<f32>(-s, c));
  return rotation * vertex;
}

struct Attributes {
  @location(0) positions: vec2<f32>,

  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceSizes: f32,
  @location(4) instanceAngles: f32,
  @location(5) instanceColors: vec4<f32>,
  @location(6) instancePickingColors: vec3<f32>,
  @location(7) instanceIconFrames: vec4<f32>,
  @location(8) instanceColorModes: f32,
  @location(9) instanceOffsets: vec2<f32>,
  @location(10) instancePixelOffset: vec2<f32>,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,

  @location(0) vColorMode: f32,
  @location(1) vColor: vec4<f32>,
  @location(2) vTextureCoords: vec2<f32>,
  @location(3) uv: vec2<f32>,
  @location(4) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(inp: Attributes) -> Varyings {
  // write geometry fields used by filters + FS
  geometry.worldPosition = inp.instancePositions;
  geometry.uv = inp.positions;
  geometry.pickingColor = inp.instancePickingColors;

  var outp: Varyings;
  outp.uv = inp.positions;

  let iconSize = inp.instanceIconFrames.zw;

  // convert size in meters to pixels, then clamp
  let sizePixels = clamp(
    project_unit_size_to_pixel(inp.instanceSizes * icon.sizeScale, icon.sizeUnits),
    icon.sizeMinPixels, icon.sizeMaxPixels
  );

  // scale icon height to match instanceSize
  let iconConstraint = select(iconSize.y, iconSize.x, icon.sizeBasis == 0.0);
  let instanceScale = select(sizePixels / iconConstraint, 0.0, iconConstraint == 0.0);

  // scale and rotate vertex in "pixel" units; then add per-instance pixel offset
  var pixelOffset = inp.positions / 2.0 * iconSize + inp.instanceOffsets;
  pixelOffset = rotate_by_angle(pixelOffset, inp.instanceAngles) * instanceScale;
  pixelOffset = pixelOffset + inp.instancePixelOffset;
  pixelOffset.y = pixelOffset.y * -1.0;

  if (icon.billboard != 0) {
    var pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, vec3<f32>(0.0)); // TODO, &geometry.position);
    // DECKGL_FILTER_GL_POSITION(pos, geometry);

    var offset = vec3<f32>(pixelOffset, 0.0);
    // DECKGL_FILTER_SIZE(offset, geometry);
    let clipOffset = project_pixel_size_to_clipspace(offset.xy);
    pos = vec4<f32>(pos.x + clipOffset.x, pos.y + clipOffset.y, pos.z, pos.w);
    outp.position = pos;
  } else {
    var offset_common = vec3<f32>(project_pixel_size_vec2(pixelOffset), 0.0);
    // DECKGL_FILTER_SIZE(offset_common, geometry);
    var pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, offset_common); // TODO, &geometry.position);
    // DECKGL_FILTER_GL_POSITION(pos, geometry);
    outp.position = pos;
  }

  let uvMix = (inp.positions.xy + vec2<f32>(1.0, 1.0)) * 0.5;
  outp.vTextureCoords = mix(inp.instanceIconFrames.xy, inp.instanceIconFrames.xy + iconSize, uvMix) / icon.iconsTextureDim;

  outp.vColor = inp.instanceColors;
  // DECKGL_FILTER_COLOR(outp.vColor, geometry);

  outp.vColorMode = inp.instanceColorModes;
  outp.pickingColor = inp.instancePickingColors;

  return outp;
}

@fragment
fn fragmentMain(inp: Varyings) -> @location(0) vec4<f32> {
  // expose to deck.gl filter hooks
  geometry.uv = inp.uv;

  let texColor = textureSample(iconsTexture, iconsTextureSampler, inp.vTextureCoords);

  // if colorMode == 0, use pixel color from the texture
  // if colorMode == 1 (or picking), use texture as transparency mask
  let rgb = mix(texColor.rgb, inp.vColor.rgb, inp.vColorMode);
  let a = texColor.a * layer.opacity * inp.vColor.a;

  if (a < icon.alphaCutoff) {
    discard;
  }

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(inp.pickingColor)) {
      discard;
    }
    return vec4<f32>(inp.pickingColor, 1.0);
  }

  var fragColor = deckgl_premultiplied_alpha(vec4<f32>(rgb, a));

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(inp.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  return fragColor;
}
`,ye=1024,be=4,xe=()=>{},Se={minFilter:`linear`,mipmapFilter:`linear`,magFilter:`linear`,addressModeU:`clamp-to-edge`,addressModeV:`clamp-to-edge`},Ce={x:0,y:0,width:0,height:0};function we(e){return 2**Math.ceil(Math.log2(e))}function Te(e,t,n,r){let i=Math.min(n/t.width,r/t.height),a=Math.floor(t.width*i),o=Math.floor(t.height*i);return i===1?{image:t,width:a,height:o}:(e.canvas.height=o,e.canvas.width=a,e.clearRect(0,0,a,o),e.drawImage(t,0,0,t.width,t.height,0,0,a,o),{image:e.canvas,width:a,height:o})}function F(e){return e&&(e.id||e.url)}function Ee(e){let{device:t}=e;t.type===`webgl`?e.generateMipmapsWebGL():t.type===`webgpu`&&t.generateMipmapsWebGPU(e)}function De(e,t,n,r){let{width:i,height:a,device:o}=e,s=o.createTexture({format:`rgba8unorm`,width:t,height:n,sampler:r,mipLevels:o.getMipLevelCount(t,n)}),c=o.createCommandEncoder();c.copyTextureToTexture({sourceTexture:e,destinationTexture:s,width:i,height:a});let l=c.finish();return o.submit(l),Ee(s),e.destroy(),s}function Oe(e,t,n){for(let r=0;r<t.length;r++){let{icon:i,xOffset:a}=t[r],o=F(i);e[o]={...i,x:a,y:n}}}function ke({icons:e,buffer:t,mapping:n={},xOffset:r=0,yOffset:i=0,rowHeight:a=0,canvasWidth:o}){let s=[];for(let c=0;c<e.length;c++){let l=e[c];if(!n[F(l)]){let{height:e,width:c}=l;r+c+t>o&&(Oe(n,s,i),r=0,i=a+i+t,a=0,s=[]),s.push({icon:l,xOffset:r}),r=r+c+t,a=Math.max(a,e)}}return s.length>0&&Oe(n,s,i),{mapping:n,rowHeight:a,xOffset:r,yOffset:i,canvasWidth:o,canvasHeight:we(a+i+t)}}function Ae(e,t,n){if(!e||!t)return null;n||={};let r={},{iterable:i,objectInfo:a}=p(e);for(let e of i){a.index++;let i=t(e,a),o=F(i);if(!i)throw Error(`Icon is missing.`);if(!i.url)throw Error(`Icon url is missing.`);!r[o]&&(!n[o]||i.url!==n[o].url)&&(r[o]={...i,source:e,sourceIndex:a.index})}return r}var je=class{constructor(e,{onUpdate:t=xe,onError:n=xe}){this._loadOptions=null,this._texture=null,this._externalTexture=null,this._mapping={},this._samplerParameters=null,this._pendingCount=0,this._autoPacking=!1,this._xOffset=0,this._yOffset=0,this._rowHeight=0,this._buffer=be,this._canvasWidth=ye,this._canvasHeight=0,this._canvas=null,this.device=e,this.onUpdate=t,this.onError=n}finalize(){this._texture?.delete()}getTexture(){return this._texture||this._externalTexture}getIconMapping(e){let t=this._autoPacking?F(e):e;return this._mapping[t]||Ce}setProps({loadOptions:e,autoPacking:t,iconAtlas:n,iconMapping:r,textureParameters:i}){e&&(this._loadOptions=e),t!==void 0&&(this._autoPacking=t),r&&(this._mapping=r),n&&(this._texture?.delete(),this._texture=null,this._externalTexture=n),i&&(this._samplerParameters=i)}get isLoaded(){return this._pendingCount===0}packIcons(e,t){if(!this._autoPacking||typeof document>`u`)return;let n=Object.values(Ae(e,t,this._mapping)||{});if(n.length>0){let{mapping:e,xOffset:t,yOffset:r,rowHeight:i,canvasHeight:a}=ke({icons:n,buffer:this._buffer,canvasWidth:this._canvasWidth,mapping:this._mapping,rowHeight:this._rowHeight,xOffset:this._xOffset,yOffset:this._yOffset});this._rowHeight=i,this._mapping=e,this._xOffset=t,this._yOffset=r,this._canvasHeight=a,this._texture||=this.device.createTexture({format:`rgba8unorm`,data:null,width:this._canvasWidth,height:this._canvasHeight,sampler:this._samplerParameters||Se,mipLevels:this.device.getMipLevelCount(this._canvasWidth,this._canvasHeight)}),this._texture.height!==this._canvasHeight&&(this._texture=De(this._texture,this._canvasWidth,this._canvasHeight,this._samplerParameters||Se)),this.onUpdate(!0),this._canvas=this._canvas||document.createElement(`canvas`),this._loadIcons(n)}}_loadIcons(e){let t=this._canvas.getContext(`2d`,{willReadFrequently:!0});for(let n of e)this._pendingCount++,i(n.url,this._loadOptions).then(e=>{let r=F(n),i=this._mapping[r],{x:a,y:o,width:s,height:c}=i,{image:l,width:u,height:d}=Te(t,e,s,c),f=a+(s-u)/2,p=o+(c-d)/2;this._texture?.copyExternalImage({image:l,x:f,y:p,width:u,height:d}),i.x=f,i.y=p,i.width=u,i.height=d,this._texture&&Ee(this._texture),this.onUpdate(u!==s||d!==c)}).catch(e=>{this.onError({url:n.url,source:n.source,sourceIndex:n.sourceIndex,loadOptions:this._loadOptions,error:e})}).finally(()=>{this._pendingCount--})}},Me=[0,0,0,255],Ne={iconAtlas:{type:`image`,value:null,async:!0},iconMapping:{type:`object`,value:{},async:!0},sizeScale:{type:`number`,value:1,min:0},billboard:!0,sizeUnits:`pixels`,sizeBasis:`height`,sizeMinPixels:{type:`number`,min:0,value:0},sizeMaxPixels:{type:`number`,min:0,value:2**53-1},alphaCutoff:{type:`number`,value:.05,min:0,max:1},getPosition:{type:`accessor`,value:e=>e.position},getIcon:{type:`accessor`,value:e=>e.icon},getColor:{type:`accessor`,value:Me},getSize:{type:`accessor`,value:1},getAngle:{type:`accessor`,value:0},getPixelOffset:{type:`accessor`,value:[0,0]},onIconError:{type:`function`,value:null,optional:!0},textureParameters:{type:`object`,ignore:!0,value:null}},I=class extends a{getShaders(){return super.getShaders({vs:ge,fs:_e,source:ve,modules:[h,o,l,he]})}initializeState(){this.state={iconManager:new je(this.context.device,{onUpdate:this._onUpdate.bind(this),onError:this._onError.bind(this)})},this.getAttributeManager().addInstanced({instancePositions:{size:3,type:`float64`,fp64:this.use64bitPositions(),transition:!0,accessor:`getPosition`},instanceSizes:{size:1,transition:!0,accessor:`getSize`,defaultValue:1},instanceIconDefs:{size:7,accessor:`getIcon`,transform:this.getInstanceIconDef,shaderAttributes:{instanceOffsets:{size:2,elementOffset:0},instanceIconFrames:{size:4,elementOffset:2},instanceColorModes:{size:1,elementOffset:6}}},instanceColors:{size:this.props.colorFormat.length,type:`unorm8`,transition:!0,accessor:`getColor`,defaultValue:Me},instanceAngles:{size:1,transition:!0,accessor:`getAngle`},instancePixelOffset:{size:2,transition:!0,accessor:`getPixelOffset`}})}updateState(e){super.updateState(e);let{props:t,oldProps:n,changeFlags:r}=e,i=this.getAttributeManager(),{iconAtlas:a,iconMapping:o,data:s,getIcon:c,textureParameters:l}=t,{iconManager:u}=this.state;if(typeof a==`string`)return;let d=a||this.internalState.isAsyncPropLoading(`iconAtlas`);u.setProps({loadOptions:t.loadOptions,autoPacking:!d,iconAtlas:a,iconMapping:d?o:null,textureParameters:l}),d?n.iconMapping!==t.iconMapping&&i.invalidate(`getIcon`):(r.dataChanged||r.updateTriggersChanged&&(r.updateTriggersChanged.all||r.updateTriggersChanged.getIcon))&&u.packIcons(s,c),r.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),i.invalidateAll())}get isLoaded(){return super.isLoaded&&this.state.iconManager.isLoaded}finalizeState(e){super.finalizeState(e),this.state.iconManager.finalize()}draw({uniforms:e}){let{sizeScale:t,sizeBasis:n,sizeMinPixels:r,sizeMaxPixels:i,sizeUnits:a,billboard:o,alphaCutoff:s}=this.props,{iconManager:c}=this.state,l=c.getTexture();if(l){let e=this.state.model,c={iconsTexture:l,iconsTextureDim:[l.width,l.height],sizeUnits:v[a],sizeScale:t,sizeBasis:+(n===`height`),sizeMinPixels:r,sizeMaxPixels:i,billboard:o,alphaCutoff:s};e.shaderInputs.setProps({icon:c}),e.draw(this.context.renderPass)}}_getModel(){let e=[-1,-1,1,-1,-1,1,1,1];return new m(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new s({topology:`triangle-strip`,attributes:{positions:{size:2,value:new Float32Array(e)}}}),isInstanced:!0})}_onUpdate(e){e?(this.getAttributeManager()?.invalidate(`getIcon`),this.setNeedsUpdate()):this.setNeedsRedraw()}_onError(e){let t=this.getCurrentLayer()?.props.onIconError;t?t(e):g.error(e.error.message)()}getInstanceIconDef(e){let{x:t,y:n,width:r,height:i,mask:a,anchorX:o=r/2,anchorY:s=i/2}=this.state.iconManager.getIconMapping(e);return[r/2-o,i/2-s,t,n,r,i,+!!a]}};I.defaultProps=Ne,I.layerName=`IconLayer`;var Pe=`layout(std140) uniform lineUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float useShortestPath;
  highp int widthUnits;
} line;
`,Fe={name:`line`,source:``,vs:Pe,fs:Pe,uniformTypes:{widthScale:`f32`,widthMinPixels:`f32`,widthMaxPixels:`f32`,useShortestPath:`f32`,widthUnits:`i32`}},Ie=`// ---------- Helper Structures & Functions ----------

// Placeholder filter functions.
fn deckgl_filter_size(offset: vec3<f32>, geometry: Geometry) -> vec3<f32> {
  return offset;
}
fn deckgl_filter_gl_position(p: vec4<f32>, geometry: Geometry) -> vec4<f32> {
  if (picking.isAttribute > 0.5) {
    // For depth picking, write normalized depth into the picking payload.
    // This mirrors the legacy DECKGL_FILTER_GL_POSITION hook on WebGL.
  }
  return p;
}

// Compute an extrusion offset given a line direction (in clipspace),
// an offset direction (-1 or 1), and a width in pixels.
// Assumes a uniform "project" with a viewportSize field is available.
fn getExtrusionOffset(line_clipspace: vec2<f32>, offset_direction: f32, width: f32) -> vec2<f32> {
  // project.viewportSize should be provided as a uniform (not shown here)
  let dir_screenspace = normalize(line_clipspace * project.viewportSize);
  // Rotate by 90°: (x,y) becomes (-y,x)
  let rotated = vec2<f32>(-dir_screenspace.y, dir_screenspace.x);
  return rotated * offset_direction * width / 2.0;
}

// Splits the line between two points at a given x coordinate.
// Interpolates the y and z components.
fn splitLine(a: vec3<f32>, b: vec3<f32>, x: f32) -> vec3<f32> {
  let t: f32 = (x - a.x) / (b.x - a.x);
  return vec3<f32>(x, a.yz + t * (b.yz - a.yz));
}

// ---------- Uniforms & Global Structures ----------

struct LineUniforms {
  widthScale: f32,
  widthMinPixels: f32,
  widthMaxPixels: f32,
  useShortestPath: f32,
  widthUnits: i32,
};

@group(0) @binding(0)
var<uniform> line: LineUniforms;



// ---------- Vertex Output Structure ----------

struct Varyings {
  @builtin(position) gl_Position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) uv: vec2<f32>,
  @location(2) pickingColor: vec3<f32>,
};

// ---------- Vertex Shader Entry Point ----------

@vertex
fn vertexMain(
  @location(0) positions: vec3<f32>,
  @location(1) instanceSourcePositions: vec3<f32>,
  @location(2) instanceTargetPositions: vec3<f32>,
  @location(3) instanceSourcePositions64Low: vec3<f32>,
  @location(4) instanceTargetPositions64Low: vec3<f32>,
  @location(5) instanceColors: vec4<f32>,
  @location(6) instancePickingColors: vec3<f32>,
  @location(7) instanceWidths: f32
) -> Varyings {
  geometry.worldPosition = instanceSourcePositions;
  geometry.worldPositionAlt = instanceTargetPositions;

  var source_world: vec3<f32> = instanceSourcePositions;
  var target_world: vec3<f32> = instanceTargetPositions;
  var source_world_64low: vec3<f32> = instanceSourcePositions64Low;
  var target_world_64low: vec3<f32> = instanceTargetPositions64Low;

  // Apply shortest-path adjustments if needed.
  if (line.useShortestPath > 0.5 || line.useShortestPath < -0.5) {
    source_world.x = (source_world.x + 180.0 % 360.0) - 180.0;
    target_world.x = (target_world.x + 180.0 % 360.0) - 180.0;
    let deltaLng: f32 = target_world.x - source_world.x;

    if (deltaLng * line.useShortestPath > 180.0) {
      source_world.x = source_world.x + 360.0 * line.useShortestPath;
      source_world = splitLine(source_world, target_world, 180.0 * line.useShortestPath);
      source_world_64low = vec3<f32>(0.0, 0.0, 0.0);
    } else if (deltaLng * line.useShortestPath < -180.0) {
      target_world.x = target_world.x + 360.0 * line.useShortestPath;
      target_world = splitLine(source_world, target_world, 180.0 * line.useShortestPath);
      target_world_64low = vec3<f32>(0.0, 0.0, 0.0);
    } else if (line.useShortestPath < 0.0) {
      var abortOut: Varyings;
      abortOut.gl_Position = vec4<f32>(0.0);
      abortOut.vColor = vec4<f32>(0.0);
      abortOut.uv = vec2<f32>(0.0);
      return abortOut;
    }
  }

  // Project Pos and target positions to clip space.
  let sourceResult = project_position_to_clipspace_and_commonspace(source_world, source_world_64low, vec3<f32>(0.0));
  let targetResult = project_position_to_clipspace_and_commonspace(target_world, target_world_64low, vec3<f32>(0.0));
  let sourcePos: vec4<f32> = sourceResult.clipPosition;
  let targetPos: vec4<f32> = targetResult.clipPosition;
  let source_commonspace: vec4<f32> = sourceResult.commonPosition;
  let target_commonspace: vec4<f32> = targetResult.commonPosition;

  // Interpolate along the line segment.
  let segmentIndex: f32 = positions.x;
  let p: vec4<f32> = sourcePos + segmentIndex * (targetPos - sourcePos);
  geometry.position = source_commonspace + segmentIndex * (target_commonspace - source_commonspace);
  let uv: vec2<f32> = positions.xy;
  geometry.uv = uv;
  geometry.pickingColor = instancePickingColors;

  // Determine width in pixels.
  let widthPixels: f32 = clamp(
    project_unit_size_to_pixel(instanceWidths * line.widthScale, line.widthUnits),
    line.widthMinPixels, line.widthMaxPixels
  );

  // Compute extrusion offset.
  let extrusion: vec2<f32> = getExtrusionOffset(targetPos.xy - sourcePos.xy, positions.y, widthPixels);
  let offset: vec3<f32> = vec3<f32>(extrusion, 0.0);

  // Apply deck.gl filter functions.
  let filteredOffset = deckgl_filter_size(offset, geometry);
  let filteredP = deckgl_filter_gl_position(p, geometry);

  let clipOffset: vec2<f32> = project_pixel_size_to_clipspace(filteredOffset.xy);
  let finalPosition: vec4<f32> = filteredP + vec4<f32>(clipOffset, 0.0, 0.0);

  // Compute color.
  var vColor: vec4<f32> = vec4<f32>(instanceColors.rgb, instanceColors.a * layer.opacity);
  // vColor = deckgl_filter_color(vColor, geometry);

  var output: Varyings;
  output.gl_Position = finalPosition;
  output.vColor = vColor;
  output.uv = uv;
  output.pickingColor = instancePickingColors;
  return output;
}

@fragment
fn fragmentMain(
  @location(0) vColor: vec4<f32>,
  @location(1) uv: vec2<f32>,
  @location(2) pickingColor: vec3<f32>
) -> @location(0) vec4<f32> {
  // Create and initialize geometry with the provided uv.
  var geometry: Geometry;
  geometry.uv = uv;

  // Start with the input color.
  var fragColor: vec4<f32> = vColor;

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(pickingColor)) {
      discard;
    }
    return vec4<f32>(pickingColor, 1.0);
  }

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  // Apply premultiplied alpha as required by transparent canvas
  fragColor = deckgl_premultiplied_alpha(fragColor);

  return fragColor;
}
`,Le=`#version 300 es
#define SHADER_NAME line-layer-vertex-shader
in vec3 positions;
in vec3 instanceSourcePositions;
in vec3 instanceTargetPositions;
in vec3 instanceSourcePositions64Low;
in vec3 instanceTargetPositions64Low;
in vec4 instanceColors;
in vec3 instancePickingColors;
in float instanceWidths;
out vec4 vColor;
out vec2 uv;
vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction, float width) {
vec2 dir_screenspace = normalize(line_clipspace * project.viewportSize);
dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);
return dir_screenspace * offset_direction * width / 2.0;
}
vec3 splitLine(vec3 a, vec3 b, float x) {
float t = (x - a.x) / (b.x - a.x);
return vec3(x, mix(a.yz, b.yz, t));
}
void main(void) {
geometry.worldPosition = instanceSourcePositions;
geometry.worldPositionAlt = instanceTargetPositions;
vec3 source_world = instanceSourcePositions;
vec3 target_world = instanceTargetPositions;
vec3 source_world_64low = instanceSourcePositions64Low;
vec3 target_world_64low = instanceTargetPositions64Low;
if (line.useShortestPath > 0.5 || line.useShortestPath < -0.5) {
source_world.x = mod(source_world.x + 180., 360.0) - 180.;
target_world.x = mod(target_world.x + 180., 360.0) - 180.;
float deltaLng = target_world.x - source_world.x;
if (deltaLng * line.useShortestPath > 180.) {
source_world.x += 360. * line.useShortestPath;
source_world = splitLine(source_world, target_world, 180. * line.useShortestPath);
source_world_64low = vec3(0.0);
} else if (deltaLng * line.useShortestPath < -180.) {
target_world.x += 360. * line.useShortestPath;
target_world = splitLine(source_world, target_world, 180. * line.useShortestPath);
target_world_64low = vec3(0.0);
} else if (line.useShortestPath < 0.) {
gl_Position = vec4(0.);
return;
}
}
vec4 source_commonspace;
vec4 target_commonspace;
vec4 source = project_position_to_clipspace(source_world, source_world_64low, vec3(0.), source_commonspace);
vec4 target = project_position_to_clipspace(target_world, target_world_64low, vec3(0.), target_commonspace);
float segmentIndex = positions.x;
vec4 p = mix(source, target, segmentIndex);
geometry.position = mix(source_commonspace, target_commonspace, segmentIndex);
uv = positions.xy;
geometry.uv = uv;
geometry.pickingColor = instancePickingColors;
float widthPixels = clamp(
project_size_to_pixel(instanceWidths * line.widthScale, line.widthUnits),
line.widthMinPixels, line.widthMaxPixels
);
vec3 offset = vec3(
getExtrusionOffset(target.xy - source.xy, positions.y, widthPixels),
0.0);
DECKGL_FILTER_SIZE(offset, geometry);
DECKGL_FILTER_GL_POSITION(p, geometry);
gl_Position = p + vec4(project_pixel_size_to_clipspace(offset.xy), 0.0, 0.0);
vColor = vec4(instanceColors.rgb, instanceColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,Re=`#version 300 es
#define SHADER_NAME line-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 uv;
out vec4 fragColor;
void main(void) {
geometry.uv = uv;
fragColor = vColor;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,ze={getSourcePosition:{type:`accessor`,value:e=>e.sourcePosition},getTargetPosition:{type:`accessor`,value:e=>e.targetPosition},getColor:{type:`accessor`,value:[0,0,0,255]},getWidth:{type:`accessor`,value:1},widthUnits:`pixels`,widthScale:{type:`number`,value:1,min:0},widthMinPixels:{type:`number`,value:0,min:0},widthMaxPixels:{type:`number`,value:2**53-1,min:0}},Be=class extends a{getBounds(){return this.getAttributeManager()?.getBounds([`instanceSourcePositions`,`instanceTargetPositions`])}getShaders(){return super.getShaders({vs:Le,fs:Re,source:Ie,modules:[h,o,l,Fe]})}get wrapLongitude(){return!1}initializeState(){this.getAttributeManager().addInstanced({instanceSourcePositions:{size:3,type:`float64`,fp64:this.use64bitPositions(),transition:!0,accessor:`getSourcePosition`},instanceTargetPositions:{size:3,type:`float64`,fp64:this.use64bitPositions(),transition:!0,accessor:`getTargetPosition`},instanceColors:{size:this.props.colorFormat.length,type:`unorm8`,transition:!0,accessor:`getColor`,defaultValue:[0,0,0,255]},instanceWidths:{size:1,transition:!0,accessor:`getWidth`,defaultValue:1}})}updateState(e){super.updateState(e),e.changeFlags.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:e}){let{widthUnits:t,widthScale:n,widthMinPixels:r,widthMaxPixels:i,wrapLongitude:a}=this.props,o=this.state.model,s={widthUnits:v[t],widthScale:n,widthMinPixels:r,widthMaxPixels:i,useShortestPath:+!!a};o.shaderInputs.setProps({line:s}),o.draw(this.context.renderPass),a&&(o.shaderInputs.setProps({line:{...s,useShortestPath:-1}}),o.draw(this.context.renderPass))}_getModel(){let e=[0,-1,0,0,1,0,1,-1,0,1,1,0];return new m(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new s({topology:`triangle-strip`,attributes:{positions:{size:3,value:new Float32Array(e)}}}),isInstanced:!0})}};Be.layerName=`LineLayer`,Be.defaultProps=ze;var Ve=`layout(std140) uniform pointCloudUniforms {
  float radiusPixels;
  highp int sizeUnits;
} pointCloud;
`,He={name:`pointCloud`,source:``,vs:Ve,fs:Ve,uniformTypes:{radiusPixels:`f32`,sizeUnits:`i32`}},Ue=`#version 300 es
#define SHADER_NAME point-cloud-layer-vertex-shader
in vec3 positions;
in vec3 instanceNormals;
in vec4 instanceColors;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec3 instancePickingColors;
out vec4 vColor;
out vec2 unitPosition;
void main(void) {
geometry.worldPosition = instancePositions;
geometry.normal = project_normal(instanceNormals);
unitPosition = positions.xy;
geometry.uv = unitPosition;
geometry.pickingColor = instancePickingColors;
vec3 offset = vec3(positions.xy * project_size_to_pixel(pointCloud.radiusPixels, pointCloud.sizeUnits), 0.0);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
vec3 lightColor = lighting_getLightColor(instanceColors.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
vColor = vec4(lightColor, instanceColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,We=`#version 300 es
#define SHADER_NAME point-cloud-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 unitPosition;
out vec4 fragColor;
void main(void) {
geometry.uv = unitPosition.xy;
float distToCenter = length(unitPosition);
if (distToCenter > 1.0) {
discard;
}
fragColor = vColor;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,Ge=`struct PointCloudUniforms {
  radiusPixels: f32,
  sizeUnits: i32,
};

@group(0) @binding(0)
var<uniform> pointCloudUniforms: PointCloudUniforms;

struct ConstantAttributes {
  instanceNormals: vec3<f32>,
  instanceColors: vec4<f32>,
  instancePositions: vec3<f32>,
  instancePositions64Low: vec3<f32>,
  instancePickingColors: vec3<f32>
};

const constants = ConstantAttributes(
  vec3<f32>(1.0, 0.0, 0.0),
  vec4<f32>(0.0, 0.0, 0.0, 1.0),
  vec3<f32>(0.0),
  vec3<f32>(0.0),
  vec3<f32>(0.0)
);

struct Attributes {
  @builtin(instance_index) instanceIndex : u32,
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) positions: vec3<f32>,
  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceNormals: vec3<f32>,
  @location(4) instanceColors: vec4<f32>,
  @location(5) instancePickingColors: vec3<f32>
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) unitPosition: vec2<f32>,
  @location(2) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  geometry.worldPosition = attributes.instancePositions;

  let centerResult = project_position_to_clipspace_and_commonspace(
    attributes.instancePositions,
    attributes.instancePositions64Low,
    vec3<f32>(0.0)
  );
  geometry.position = centerResult.commonPosition;
  geometry.normal = project_normal(attributes.instanceNormals);

  // position on the containing square in [-1, 1] space
  varyings.unitPosition = attributes.positions.xy;
  geometry.uv = varyings.unitPosition;
  geometry.pickingColor = attributes.instancePickingColors;

  // Find the center of the point and add the current vertex
  let offset = vec3<f32>(
    attributes.positions.xy *
      project_unit_size_to_pixel(pointCloudUniforms.radiusPixels, pointCloudUniforms.sizeUnits),
    0.0
  );
  // DECKGL_FILTER_SIZE(offset, geometry);

  varyings.position = centerResult.clipPosition;
  // DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  let clipPixels = project_pixel_size_to_clipspace(offset.xy);
  varyings.position.x += clipPixels.x;
  varyings.position.y += clipPixels.y;

  // Apply lighting
  let lightColor = lighting_getLightColor2(attributes.instanceColors.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);

  // Apply opacity to instance color, or return instance picking color
  varyings.vColor = vec4(lightColor, attributes.instanceColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(vColor, geometry);
  varyings.pickingColor = attributes.instancePickingColors;

  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  // var geometry: Geometry;
  // geometry.uv = unitPosition.xy;

  let distToCenter = length(varyings.unitPosition);
  if (distToCenter > 1.0) {
    discard;
  }

  var fragColor: vec4<f32>;

  fragColor = varyings.vColor;

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  // Apply premultiplied alpha as required by transparent canvas
  fragColor = deckgl_premultiplied_alpha(fragColor);

  return fragColor;
}
`,Ke=[0,0,0,255],qe=[0,0,1],Je={sizeUnits:`pixels`,pointSize:{type:`number`,min:0,value:10},getPosition:{type:`accessor`,value:e=>e.position},getNormal:{type:`accessor`,value:qe},getColor:{type:`accessor`,value:Ke},material:!0,radiusPixels:{deprecatedFor:`pointSize`}};function Ye(e){let{header:t,attributes:n}=e;if(!(!t||!n)&&(e.length=t.vertexCount,n.POSITION&&(n.instancePositions=n.POSITION),n.NORMAL&&(n.instanceNormals=n.NORMAL),n.COLOR_0)){let{size:e,value:t}=n.COLOR_0;n.instanceColors={size:e,type:`unorm8`,value:t}}}var Xe=class extends a{getShaders(){return super.getShaders({vs:Ue,fs:We,source:Ge,modules:[h,o,r,l,He]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:3,type:`float64`,fp64:this.use64bitPositions(),transition:!0,accessor:`getPosition`},instanceNormals:{size:3,transition:!0,accessor:`getNormal`,defaultValue:qe},instanceColors:{size:this.props.colorFormat.length,type:`unorm8`,transition:!0,accessor:`getColor`,defaultValue:Ke}})}updateState(e){let{changeFlags:t,props:n}=e;super.updateState(e),t.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll()),t.dataChanged&&Ye(n.data)}draw({uniforms:e}){let{pointSize:t,sizeUnits:n}=this.props,r=this.state.model,i={sizeUnits:v[n],radiusPixels:t};r.shaderInputs.setProps({pointCloud:i}),r.draw(this.context.renderPass)}_getModel(){let e=[];for(let t=0;t<3;t++){let n=t/3*Math.PI*2;e.push(Math.cos(n)*2,Math.sin(n)*2,0)}return new m(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new s({topology:`triangle-list`,attributes:{positions:new Float32Array(e)}}),isInstanced:!0})}};Xe.layerName=`PointCloudLayer`,Xe.defaultProps=Je;var Ze=`layout(std140) uniform scatterplotUniforms {
  float radiusScale;
  float radiusMinPixels;
  float radiusMaxPixels;
  float lineWidthScale;
  float lineWidthMinPixels;
  float lineWidthMaxPixels;
  float stroked;
  float filled;
  bool antialiasing;
  bool billboard;
  highp int radiusUnits;
  highp int lineWidthUnits;
} scatterplot;
`,Qe={name:`scatterplot`,vs:Ze,fs:Ze,source:``,uniformTypes:{radiusScale:`f32`,radiusMinPixels:`f32`,radiusMaxPixels:`f32`,lineWidthScale:`f32`,lineWidthMinPixels:`f32`,lineWidthMaxPixels:`f32`,stroked:`f32`,filled:`f32`,antialiasing:`f32`,billboard:`f32`,radiusUnits:`i32`,lineWidthUnits:`i32`}},$e=`#version 300 es
#define SHADER_NAME scatterplot-layer-vertex-shader
in vec3 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceRadius;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in vec3 instancePickingColors;
out vec4 vFillColor;
out vec4 vLineColor;
out vec2 unitPosition;
out float innerUnitRadius;
out float outerRadiusPixels;
void main(void) {
geometry.worldPosition = instancePositions;
outerRadiusPixels = clamp(
project_size_to_pixel(scatterplot.radiusScale * instanceRadius, scatterplot.radiusUnits),
scatterplot.radiusMinPixels, scatterplot.radiusMaxPixels
);
float lineWidthPixels = clamp(
project_size_to_pixel(scatterplot.lineWidthScale * instanceLineWidths, scatterplot.lineWidthUnits),
scatterplot.lineWidthMinPixels, scatterplot.lineWidthMaxPixels
);
outerRadiusPixels += scatterplot.stroked * lineWidthPixels / 2.0;
float edgePadding = scatterplot.antialiasing ? (outerRadiusPixels + SMOOTH_EDGE_RADIUS) / outerRadiusPixels : 1.0;
unitPosition = edgePadding * positions.xy;
geometry.uv = unitPosition;
geometry.pickingColor = instancePickingColors;
innerUnitRadius = 1.0 - scatterplot.stroked * lineWidthPixels / outerRadiusPixels;
if (scatterplot.billboard) {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = edgePadding * positions * outerRadiusPixels;
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset = edgePadding * positions * project_pixel_size(outerRadiusPixels);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vFillColor, geometry);
vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`,et=`#version 300 es
#define SHADER_NAME scatterplot-layer-fragment-shader
precision highp float;
in vec4 vFillColor;
in vec4 vLineColor;
in vec2 unitPosition;
in float innerUnitRadius;
in float outerRadiusPixels;
out vec4 fragColor;
void main(void) {
geometry.uv = unitPosition;
float distToCenter = length(unitPosition) * outerRadiusPixels;
float inCircle = scatterplot.antialiasing ?
smoothedge(distToCenter, outerRadiusPixels) :
step(distToCenter, outerRadiusPixels);
if (inCircle == 0.0) {
discard;
}
if (scatterplot.stroked > 0.5) {
float isLine = scatterplot.antialiasing ?
smoothedge(innerUnitRadius * outerRadiusPixels, distToCenter) :
step(innerUnitRadius * outerRadiusPixels, distToCenter);
if (scatterplot.filled > 0.5) {
fragColor = mix(vFillColor, vLineColor, isLine);
} else {
if (isLine == 0.0) {
discard;
}
fragColor = vec4(vLineColor.rgb, vLineColor.a * isLine);
}
} else if (scatterplot.filled < 0.5) {
discard;
} else {
fragColor = vFillColor;
}
fragColor.a *= inCircle;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,tt=`// Main shaders

struct ScatterplotUniforms {
  radiusScale: f32,
  radiusMinPixels: f32,
  radiusMaxPixels: f32,
  lineWidthScale: f32,
  lineWidthMinPixels: f32,
  lineWidthMaxPixels: f32,
  stroked: f32,
  filled: i32,
  antialiasing: i32,
  billboard: i32,
  radiusUnits: i32,
  lineWidthUnits: i32,
};

struct ConstantAttributeUniforms {
 instancePositions: vec3<f32>,
 instancePositions64Low: vec3<f32>,
 instanceRadius: f32,
 instanceLineWidths: f32,
 instanceFillColors: vec4<f32>,
 instanceLineColors: vec4<f32>,
 instancePickingColors: vec3<f32>,

 instancePositionsConstant: i32,
 instancePositions64LowConstant: i32,
 instanceRadiusConstant: i32,
 instanceLineWidthsConstant: i32,
 instanceFillColorsConstant: i32,
 instanceLineColorsConstant: i32,
 instancePickingColorsConstant: i32
};

@group(0) @binding(0) var<uniform> scatterplot: ScatterplotUniforms;

struct ConstantAttributes {
  instancePositions: vec3<f32>,
  instancePositions64Low: vec3<f32>,
  instanceRadius: f32,
  instanceLineWidths: f32,
  instanceFillColors: vec4<f32>,
  instanceLineColors: vec4<f32>,
  instancePickingColors: vec3<f32>
};

const constants = ConstantAttributes(
  vec3<f32>(0.0),
  vec3<f32>(0.0),
  0.0,
  0.0,
  vec4<f32>(0.0, 0.0, 0.0, 1.0),
  vec4<f32>(0.0, 0.0, 0.0, 1.0),
  vec3<f32>(0.0)
);

struct Attributes {
  @builtin(instance_index) instanceIndex : u32,
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) positions: vec3<f32>,
  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceRadius: f32,
  @location(4) instanceLineWidths: f32,
  @location(5) instanceFillColors: vec4<f32>,
  @location(6) instanceLineColors: vec4<f32>,
  @location(7) instancePickingColors: vec3<f32>,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vFillColor: vec4<f32>,
  @location(1) vLineColor: vec4<f32>,
  @location(2) unitPosition: vec2<f32>,
  @location(3) innerUnitRadius: f32,
  @location(4) outerRadiusPixels: f32,
  @location(5) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  // Draw an inline geometry constant array clip space triangle to verify that rendering works.
  // var positions = array<vec2<f32>, 3>(vec2(0.0, 0.5), vec2(-0.5, -0.5), vec2(0.5, -0.5));
  // if (attributes.instanceIndex == 0) {
  //   varyings.position = vec4<f32>(positions[attributes.vertexIndex], 0.0, 1.0);
  //   return varyings;
  // }

  geometry.worldPosition = attributes.instancePositions;

  // Multiply out radius and clamp to limits
  varyings.outerRadiusPixels = clamp(
    project_unit_size_to_pixel(scatterplot.radiusScale * attributes.instanceRadius, scatterplot.radiusUnits),
    scatterplot.radiusMinPixels, scatterplot.radiusMaxPixels
  );

  // Multiply out line width and clamp to limits
  let lineWidthPixels = clamp(
    project_unit_size_to_pixel(scatterplot.lineWidthScale * attributes.instanceLineWidths, scatterplot.lineWidthUnits),
    scatterplot.lineWidthMinPixels, scatterplot.lineWidthMaxPixels
  );

  // outer radius needs to offset by half stroke width
  varyings.outerRadiusPixels += scatterplot.stroked * lineWidthPixels / 2.0;
  // Expand geometry to accommodate edge smoothing
  let edgePadding = select(
    (varyings.outerRadiusPixels + SMOOTH_EDGE_RADIUS) / varyings.outerRadiusPixels,
    1.0,
    scatterplot.antialiasing != 0
  );

  // position on the containing square in [-1, 1] space
  varyings.unitPosition = edgePadding * attributes.positions.xy;
  geometry.uv = varyings.unitPosition;
  geometry.pickingColor = attributes.instancePickingColors;

  varyings.innerUnitRadius = 1.0 - scatterplot.stroked * lineWidthPixels / varyings.outerRadiusPixels;

  if (scatterplot.billboard != 0) {
    varyings.position = project_position_to_clipspace(attributes.instancePositions, attributes.instancePositions64Low, vec3<f32>(0.0)); // TODO , geometry.position);
    // DECKGL_FILTER_GL_POSITION(varyings.position, geometry);
    let offset = attributes.positions; // * edgePadding * varyings.outerRadiusPixels;
    // DECKGL_FILTER_SIZE(offset, geometry);
    let clipPixels = project_pixel_size_to_clipspace(offset.xy);
    varyings.position.x = clipPixels.x;
    varyings.position.y = clipPixels.y;
  } else {
    let offset = edgePadding * attributes.positions * project_pixel_size_float(varyings.outerRadiusPixels);
    // DECKGL_FILTER_SIZE(offset, geometry);
    varyings.position = project_position_to_clipspace(attributes.instancePositions, attributes.instancePositions64Low, offset); // TODO , geometry.position);
    // DECKGL_FILTER_GL_POSITION(varyings.position, geometry);
  }

  // Apply opacity to instance color, or return instance picking color
  varyings.vFillColor = vec4<f32>(attributes.instanceFillColors.rgb, attributes.instanceFillColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(varyings.vFillColor, geometry);
  varyings.vLineColor = vec4<f32>(attributes.instanceLineColors.rgb, attributes.instanceLineColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(varyings.vLineColor, geometry);
  varyings.pickingColor = attributes.instancePickingColors;

  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  // var geometry: Geometry;
  // geometry.uv = unitPosition;

  let distToCenter = length(varyings.unitPosition) * varyings.outerRadiusPixels;
  let inCircle = select(
    smoothedge(distToCenter, varyings.outerRadiusPixels),
    step(distToCenter, varyings.outerRadiusPixels),
    scatterplot.antialiasing != 0
  );

  if (inCircle == 0.0) {
    discard;
  }

  var fragColor: vec4<f32>;

  if (scatterplot.stroked != 0) {
    let isLine = select(
      smoothedge(varyings.innerUnitRadius * varyings.outerRadiusPixels, distToCenter),
      step(varyings.innerUnitRadius * varyings.outerRadiusPixels, distToCenter),
      scatterplot.antialiasing != 0
    );

    if (scatterplot.filled != 0) {
      fragColor = mix(varyings.vFillColor, varyings.vLineColor, isLine);
    } else {
      if (isLine == 0.0) {
        discard;
      }
      fragColor = vec4<f32>(varyings.vLineColor.rgb, varyings.vLineColor.a * isLine);
    }
  } else if (scatterplot.filled == 0) {
    discard;
  } else {
    fragColor = varyings.vFillColor;
  }

  fragColor.a *= inCircle;

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  // Apply premultiplied alpha as required by transparent canvas
  fragColor = deckgl_premultiplied_alpha(fragColor);

  return fragColor;
  // return vec4<f32>(0, 0, 1, 1);
}
`,nt=[0,0,0,255],rt={radiusUnits:`meters`,radiusScale:{type:`number`,min:0,value:1},radiusMinPixels:{type:`number`,min:0,value:0},radiusMaxPixels:{type:`number`,min:0,value:2**53-1},lineWidthUnits:`meters`,lineWidthScale:{type:`number`,min:0,value:1},lineWidthMinPixels:{type:`number`,min:0,value:0},lineWidthMaxPixels:{type:`number`,min:0,value:2**53-1},stroked:!1,filled:!0,billboard:!1,antialiasing:!0,getPosition:{type:`accessor`,value:e=>e.position},getRadius:{type:`accessor`,value:1},getFillColor:{type:`accessor`,value:nt},getLineColor:{type:`accessor`,value:nt},getLineWidth:{type:`accessor`,value:1},strokeWidth:{deprecatedFor:`getLineWidth`},outline:{deprecatedFor:`stroked`},getColor:{deprecatedFor:[`getFillColor`,`getLineColor`]}},L=class extends a{getShaders(){return super.getShaders({vs:$e,fs:et,source:tt,modules:[h,o,l,Qe]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:3,type:`float64`,fp64:this.use64bitPositions(),transition:!0,accessor:`getPosition`},instanceRadius:{size:1,transition:!0,accessor:`getRadius`,defaultValue:1},instanceFillColors:{size:this.props.colorFormat.length,transition:!0,type:`unorm8`,accessor:`getFillColor`,defaultValue:[0,0,0,255]},instanceLineColors:{size:this.props.colorFormat.length,transition:!0,type:`unorm8`,accessor:`getLineColor`,defaultValue:[0,0,0,255]},instanceLineWidths:{size:1,transition:!0,accessor:`getLineWidth`,defaultValue:1}})}updateState(e){super.updateState(e),e.changeFlags.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:e}){let{radiusUnits:t,radiusScale:n,radiusMinPixels:r,radiusMaxPixels:i,stroked:a,filled:o,billboard:s,antialiasing:c,lineWidthUnits:l,lineWidthScale:u,lineWidthMinPixels:d,lineWidthMaxPixels:f}=this.props,p={stroked:a,filled:o,billboard:s,antialiasing:c,radiusUnits:v[t],radiusScale:n,radiusMinPixels:r,radiusMaxPixels:i,lineWidthUnits:v[l],lineWidthScale:u,lineWidthMinPixels:d,lineWidthMaxPixels:f},m=this.state.model;m.shaderInputs.setProps({scatterplot:p}),m.draw(this.context.renderPass)}_getModel(){let e=[-1,-1,0,1,-1,0,-1,1,0,1,1,0];return new m(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new s({topology:`triangle-strip`,attributes:{positions:{size:3,value:new Float32Array(e)}}}),isInstanced:!0})}};L.defaultProps=rt,L.layerName=`ScatterplotLayer`;var it={CLOCKWISE:1,COUNTER_CLOCKWISE:-1};function at(e,t,n={}){return ot(e,n)===t?!1:(lt(e,n),!0)}function ot(e,t={}){return Math.sign(ct(e,t))}var st={x:0,y:1,z:2};function ct(e,t={}){let{start:n=0,end:r=e.length,plane:i=`xy`}=t,a=t.size||2,o=0,s=st[i[0]],c=st[i[1]];for(let t=n,i=r-a;t<r;t+=a)o+=(e[t+s]-e[i+s])*(e[t+c]+e[i+c]),i=t;return o/2}function lt(e,t){let{start:n=0,end:r=e.length,size:i=2}=t,a=(r-n)/i,o=Math.floor(a/2);for(let t=0;t<o;++t){let r=n+t*i,o=n+(a-1-t)*i;for(let t=0;t<i;++t){let n=e[r+t];e[r+t]=e[o+t],e[o+t]=n}}}function R(e,t){let n=t.length,r=e.length;if(r>0){let i=!0;for(let a=0;a<n;a++)if(e[r-n+a]!==t[a]){i=!1;break}if(i)return!1}for(let i=0;i<n;i++)e[r+i]=t[i];return!0}function ut(e,t){let n=t.length;for(let r=0;r<n;r++)e[r]=t[r]}function z(e,t,n,r,i=[]){let a=r+t*n;for(let t=0;t<n;t++)i[t]=e[a+t];return i}function dt(e,t,n,r,i=[]){let a,o;if(n&8)a=(r[3]-e[1])/(t[1]-e[1]),o=3;else if(n&4)a=(r[1]-e[1])/(t[1]-e[1]),o=1;else if(n&2)a=(r[2]-e[0])/(t[0]-e[0]),o=2;else if(n&1)a=(r[0]-e[0])/(t[0]-e[0]),o=0;else return null;for(let n=0;n<e.length;n++)i[n]=(o&1)===n?r[o]:a*(t[n]-e[n])+e[n];return i}function B(e,t){let n=0;return e[0]<t[0]?n|=1:e[0]>t[2]&&(n|=2),e[1]<t[1]?n|=4:e[1]>t[3]&&(n|=8),n}function ft(e,t){let{size:n=2,broken:r=!1,gridResolution:i=10,gridOffset:a=[0,0],startIndex:o=0,endIndex:s=e.length}=t||{},c=(s-o)/n,l=[],u=[l],d=z(e,0,n,o),f,p,m=_t(d,i,a,[]),h=[];R(l,d);for(let t=1;t<c;t++){for(f=z(e,t,n,o,f),p=B(f,m);p;){dt(d,f,p,m,h);let e=B(h,m);e&&(dt(d,h,e,m,h),p=e),R(l,h),ut(d,h),vt(m,i,p),r&&l.length>n&&(l=[],u.push(l),R(l,d)),p=B(f,m)}R(l,f),ut(d,f)}return r?u:u[0]}var pt=0,mt=1;function ht(e,t=null,n){if(!e.length)return[];let{size:r=2,gridResolution:i=10,gridOffset:a=[0,0],edgeTypes:o=!1}=n||{},s=[],c=[{pos:e,types:o?Array(e.length/r).fill(mt):null,holes:t||[]}],l=[[],[]],u=[];for(;c.length;){let{pos:e,types:t,holes:n}=c.shift();yt(e,r,n[0]||e.length,l),u=_t(l[0],i,a,u);let d=B(l[1],u);if(d){let i=gt(e,t,r,0,n[0]||e.length,u,d),a={pos:i[0].pos,types:i[0].types,holes:[]},s={pos:i[1].pos,types:i[1].types,holes:[]};c.push(a,s);for(let c=0;c<n.length;c++)i=gt(e,t,r,n[c],n[c+1]||e.length,u,d),i[0]&&(a.holes.push(a.pos.length),a.pos=V(a.pos,i[0].pos),o&&(a.types=V(a.types,i[0].types))),i[1]&&(s.holes.push(s.pos.length),s.pos=V(s.pos,i[1].pos),o&&(s.types=V(s.types,i[1].types)))}else{let r={positions:e};o&&(r.edgeTypes=t),n.length&&(r.holeIndices=n),s.push(r)}}return s}function gt(e,t,n,r,i,a,o){let s=(i-r)/n,c=[],l=[],u=[],d=[],f=[],p,m,h,g=z(e,s-1,n,r),_=Math.sign(o&8?g[1]-a[3]:g[0]-a[2]),v=t&&t[s-1],y=0,b=0;for(let i=0;i<s;i++)p=z(e,i,n,r,p),m=Math.sign(o&8?p[1]-a[3]:p[0]-a[2]),h=t&&t[r/n+i],m&&_&&_!==m&&(dt(g,p,o,a,f),R(c,f)&&u.push(v),R(l,f)&&d.push(v)),m<=0?(R(c,p)&&u.push(h),y-=m):u.length&&(u[u.length-1]=pt),m>=0?(R(l,p)&&d.push(h),b+=m):d.length&&(d[d.length-1]=pt),ut(g,p),_=m,v=h;return[y?{pos:c,types:t&&u}:null,b?{pos:l,types:t&&d}:null]}function _t(e,t,n,r){let i=Math.floor((e[0]-n[0])/t)*t+n[0],a=Math.floor((e[1]-n[1])/t)*t+n[1];return r[0]=i,r[1]=a,r[2]=i+t,r[3]=a+t,r}function vt(e,t,n){n&8?(e[1]+=t,e[3]+=t):n&4?(e[1]-=t,e[3]-=t):n&2?(e[0]+=t,e[2]+=t):n&1&&(e[0]-=t,e[2]-=t)}function yt(e,t,n,r){let i=1/0,a=-1/0,o=1/0,s=-1/0;for(let r=0;r<n;r+=t){let t=e[r],n=e[r+1];i=t<i?t:i,a=t>a?t:a,o=n<o?n:o,s=n>s?n:s}return r[0][0]=i,r[0][1]=o,r[1][0]=a,r[1][1]=s,r}function V(e,t){for(let n=0;n<t.length;n++)e.push(t[n]);return e}var bt=85.051129;function xt(e,t){let{size:n=2,startIndex:r=0,endIndex:i=e.length,normalize:a=!0}=t||{},o=e.slice(r,i);Tt(o,n,0,i-r);let s=ft(o,{size:n,broken:!0,gridResolution:360,gridOffset:[-180,-180]});if(a)for(let e of s)Et(e,n);return s}function St(e,t=null,n){let{size:r=2,normalize:i=!0,edgeTypes:a=!1}=n||{};t||=[];let o=[],s=[],c=0,l=0;for(let i=0;i<=t.length;i++){let a=t[i]||e.length,u=l,d=Ct(e,r,c,a);for(let t=d;t<a;t++)o[l++]=e[t];for(let t=c;t<d;t++)o[l++]=e[t];Tt(o,r,u,l),wt(o,r,u,l,n?.maxLatitude),c=a,s[i]=l}s.pop();let u=ht(o,s,{size:r,gridResolution:360,gridOffset:[-180,-180],edgeTypes:a});if(i)for(let e of u)Et(e.positions,r);return u}function Ct(e,t,n,r){let i=-1,a=-1;for(let o=n+1;o<r;o+=t){let t=Math.abs(e[o]);t>i&&(i=t,a=o-1)}return a}function wt(e,t,n,r,i=bt){let a=e[n],o=e[r-t];if(Math.abs(a-o)>180){let r=z(e,0,t,n);r[0]+=Math.round((o-a)/360)*360,R(e,r),r[1]=Math.sign(r[1])*i,R(e,r),r[0]=a,R(e,r)}}function Tt(e,t,n,r){let i=e[0],a;for(let o=n;o<r;o+=t){a=e[o];let t=a-i;(t>180||t<-180)&&(a-=Math.round(t/360)*360),e[o]=i=a}}function Et(e,t){let n,r=e.length/t;for(let i=0;i<r&&(n=e[i*t],(n+180)%360==0);i++);let i=-Math.round(n/360)*360;if(i!==0)for(let n=0;n<r;n++)e[n*t]+=i}var Dt=class extends s{constructor(e){let{indices:t,attributes:n}=Ot(e);super({...e,indices:t,attributes:n})}};function Ot(e){let{radius:t,height:n=1,nradial:r=10}=e,{vertices:i}=e;i&&(g.assert(i.length>=r),i=i.flatMap(e=>[e[0],e[1]]),at(i,it.COUNTER_CLOCKWISE));let a=n>0,o=r+1,s=a?o*3+1:r,c=Math.PI*2/r,l=new Uint16Array(a?r*3*2:0),u=new Float32Array(s*3),d=new Float32Array(s*3),f=0;if(a){for(let e=0;e<o;e++){let a=e*c,o=e%r,s=Math.sin(a),l=Math.cos(a);for(let e=0;e<2;e++)u[f+0]=i?i[o*2]:l*t,u[f+1]=i?i[o*2+1]:s*t,u[f+2]=(1/2-e)*n,d[f+0]=i?i[o*2]:l,d[f+1]=i?i[o*2+1]:s,f+=3}u[f+0]=u[f-3],u[f+1]=u[f-2],u[f+2]=u[f-1],f+=3}for(let e=+!a;e<o;e++){let a=Math.floor(e/2)*Math.sign(.5-e%2),o=a*c,s=(a+r)%r,l=Math.sin(o),p=Math.cos(o);u[f+0]=i?i[s*2]:p*t,u[f+1]=i?i[s*2+1]:l*t,u[f+2]=n/2,d[f+2]=1,f+=3}if(a){let e=0;for(let t=0;t<r;t++)l[e++]=t*2+0,l[e++]=t*2+2,l[e++]=t*2+0,l[e++]=t*2+1,l[e++]=t*2+1,l[e++]=t*2+3}return{indices:l,attributes:{POSITION:{size:3,value:u},NORMAL:{size:3,value:d}}}}var kt=`layout(std140) uniform columnUniforms {
  float radius;
  float angle;
  vec2 offset;
  bool extruded;
  bool stroked;
  bool isStroke;
  float coverage;
  float elevationScale;
  float edgeDistance;
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  highp int radiusUnits;
  highp int widthUnits;
} column;
`,At={name:`column`,vs:kt,fs:kt,uniformTypes:{radius:`f32`,angle:`f32`,offset:`vec2<f32>`,extruded:`f32`,stroked:`f32`,isStroke:`f32`,coverage:`f32`,elevationScale:`f32`,edgeDistance:`f32`,widthScale:`f32`,widthMinPixels:`f32`,widthMaxPixels:`f32`,radiusUnits:`i32`,widthUnits:`i32`}},jt=`#version 300 es
#define SHADER_NAME column-layer-vertex-shader
in vec3 positions;
in vec3 normals;
in vec3 instancePositions;
in float instanceElevations;
in vec3 instancePositions64Low;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in float instanceStrokeWidths;
in vec3 instancePickingColors;
out vec4 vColor;
#ifdef FLAT_SHADING
out vec3 cameraPosition;
out vec4 position_commonspace;
#endif
void main(void) {
geometry.worldPosition = instancePositions;
vec4 color = column.isStroke ? instanceLineColors : instanceFillColors;
mat2 rotationMatrix = mat2(cos(column.angle), sin(column.angle), -sin(column.angle), cos(column.angle));
float elevation = 0.0;
float strokeOffsetRatio = 1.0;
if (column.extruded) {
elevation = instanceElevations * (positions.z + 1.0) / 2.0 * column.elevationScale;
} else if (column.stroked) {
float widthPixels = clamp(
project_size_to_pixel(instanceStrokeWidths * column.widthScale, column.widthUnits),
column.widthMinPixels, column.widthMaxPixels) / 2.0;
float halfOffset = project_pixel_size(widthPixels) / project_size(column.edgeDistance * column.coverage * column.radius);
if (column.isStroke) {
strokeOffsetRatio -= sign(positions.z) * halfOffset;
} else {
strokeOffsetRatio -= halfOffset;
}
}
float shouldRender = float(color.a > 0.0 && instanceElevations >= 0.0);
float dotRadius = column.radius * column.coverage * shouldRender;
geometry.pickingColor = instancePickingColors;
vec3 centroidPosition = vec3(instancePositions.xy, instancePositions.z + elevation);
vec3 centroidPosition64Low = instancePositions64Low;
vec2 offset = (rotationMatrix * positions.xy * strokeOffsetRatio + column.offset) * dotRadius;
if (column.radiusUnits == UNIT_METERS) {
offset = project_size(offset);
} else if (column.radiusUnits == UNIT_PIXELS) {
offset = project_pixel_size(offset);
}
vec3 pos = vec3(offset, 0.);
DECKGL_FILTER_SIZE(pos, geometry);
gl_Position = project_position_to_clipspace(centroidPosition, centroidPosition64Low, pos, geometry.position);
geometry.normal = project_normal(vec3(rotationMatrix * normals.xy, normals.z));
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
if (column.extruded && !column.isStroke) {
#ifdef FLAT_SHADING
cameraPosition = project.cameraPosition;
position_commonspace = geometry.position;
vColor = vec4(color.rgb, color.a * layer.opacity);
#else
vec3 lightColor = lighting_getLightColor(color.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
vColor = vec4(lightColor, color.a * layer.opacity);
#endif
} else {
vColor = vec4(color.rgb, color.a * layer.opacity);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,Mt=`#version 300 es
#define SHADER_NAME column-layer-fragment-shader
precision highp float;
out vec4 fragColor;
in vec4 vColor;
#ifdef FLAT_SHADING
in vec3 cameraPosition;
in vec4 position_commonspace;
#endif
void main(void) {
fragColor = vColor;
geometry.uv = vec2(0.);
#ifdef FLAT_SHADING
if (column.extruded && !column.isStroke && !bool(picking.isActive)) {
vec3 normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
fragColor.rgb = lighting_getLightColor(vColor.rgb, cameraPosition, position_commonspace.xyz, normal);
}
#endif
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,H=[0,0,0,255],Nt={diskResolution:{type:`number`,min:4,value:20},vertices:null,radius:{type:`number`,min:0,value:1e3},angle:{type:`number`,value:0},offset:{type:`array`,value:[0,0]},coverage:{type:`number`,min:0,max:1,value:1},elevationScale:{type:`number`,min:0,value:1},radiusUnits:`meters`,lineWidthUnits:`meters`,lineWidthScale:1,lineWidthMinPixels:0,lineWidthMaxPixels:2**53-1,extruded:!0,wireframe:!1,filled:!0,stroked:!1,flatShading:!1,getPosition:{type:`accessor`,value:e=>e.position},getFillColor:{type:`accessor`,value:H},getLineColor:{type:`accessor`,value:H},getLineWidth:{type:`accessor`,value:1},getElevation:{type:`accessor`,value:1e3},material:!0,getColor:{deprecatedFor:[`getFillColor`,`getLineColor`]}},U=class extends a{getShaders(){let e={},{flatShading:t}=this.props;return t&&(e.FLAT_SHADING=1),super.getShaders({vs:jt,fs:Mt,defines:e,modules:[h,t?_:r,l,At]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:3,type:`float64`,fp64:this.use64bitPositions(),transition:!0,accessor:`getPosition`},instanceElevations:{size:1,transition:!0,accessor:`getElevation`},instanceFillColors:{size:this.props.colorFormat.length,type:`unorm8`,transition:!0,accessor:`getFillColor`,defaultValue:H},instanceLineColors:{size:this.props.colorFormat.length,type:`unorm8`,transition:!0,accessor:`getLineColor`,defaultValue:H},instanceStrokeWidths:{size:1,accessor:`getLineWidth`,transition:!0}})}updateState(e){super.updateState(e);let{props:t,oldProps:n,changeFlags:r}=e,i=r.extensionsChanged||t.flatShading!==n.flatShading;i&&(this.state.models?.forEach(e=>e.destroy()),this.setState(this._getModels()),this.getAttributeManager().invalidateAll());let a=this.getNumInstances();this.state.fillModel.setInstanceCount(a),this.state.wireframeModel.setInstanceCount(a),(i||t.diskResolution!==n.diskResolution||t.vertices!==n.vertices||(t.extruded||t.stroked)!==(n.extruded||n.stroked))&&this._updateGeometry(t)}getGeometry(e,t,n){let r=new Dt({radius:1,height:n?2:0,vertices:t,nradial:e}),i=0;if(t)for(let n=0;n<e;n++){let r=t[n],a=Math.sqrt(r[0]*r[0]+r[1]*r[1]);i+=a/e}else i=1;return this.setState({edgeDistance:Math.cos(Math.PI/e)*i}),r}_getModels(){let e=this.getShaders(),t=this.getAttributeManager().getBufferLayouts(),n=new m(this.context.device,{...e,id:`${this.props.id}-fill`,bufferLayout:t,isInstanced:!0}),r=new m(this.context.device,{...e,id:`${this.props.id}-wireframe`,bufferLayout:t,isInstanced:!0});return{fillModel:n,wireframeModel:r,models:[r,n]}}_updateGeometry({diskResolution:e,vertices:t,extruded:n,stroked:r}){let i=this.getGeometry(e,t,n||r);this.setState({fillVertexCount:i.attributes.POSITION.value.length/3});let a=this.state.fillModel,o=this.state.wireframeModel;a.setGeometry(i),a.setTopology(`triangle-strip`),a.setIndexBuffer(null),o.setGeometry(i),o.setTopology(`line-list`)}draw({uniforms:e}){let{lineWidthUnits:t,lineWidthScale:n,lineWidthMinPixels:r,lineWidthMaxPixels:i,radiusUnits:a,elevationScale:o,extruded:s,filled:c,stroked:l,wireframe:u,offset:d,coverage:f,radius:p,angle:m}=this.props,h=this.state.fillModel,g=this.state.wireframeModel,{fillVertexCount:_,edgeDistance:y}=this.state,b={radius:p,angle:m/180*Math.PI,offset:d,extruded:s,stroked:l,coverage:f,elevationScale:o,edgeDistance:y,radiusUnits:v[a],widthUnits:v[t],widthScale:n,widthMinPixels:r,widthMaxPixels:i};s&&u&&(g.shaderInputs.setProps({column:{...b,isStroke:!0}}),g.draw(this.context.renderPass)),c&&(h.setVertexCount(_),h.shaderInputs.setProps({column:{...b,isStroke:!1}}),h.draw(this.context.renderPass)),!s&&l&&(h.setVertexCount(_*2/3),h.shaderInputs.setProps({column:{...b,isStroke:!0}}),h.draw(this.context.renderPass))}};U.layerName=`ColumnLayer`,U.defaultProps=Nt;var Pt={cellSize:{type:`number`,min:0,value:1e3},offset:{type:`array`,value:[1,1]}},Ft=class extends U{_updateGeometry(){let e=new y;this.state.fillModel.setGeometry(e)}draw({uniforms:e}){let{elevationScale:t,extruded:n,offset:r,coverage:i,cellSize:a,angle:o,radiusUnits:s}=this.props,c=this.state.fillModel,l={radius:a/2,radiusUnits:v[s],angle:o,offset:r,extruded:n,stroked:!1,coverage:i,elevationScale:t,edgeDistance:1,isStroke:!1,widthUnits:0,widthScale:0,widthMinPixels:0,widthMaxPixels:0};c.shaderInputs.setProps({column:l}),c.draw(this.context.renderPass)}};Ft.layerName=`GridCellLayer`,Ft.defaultProps=Pt;function It(e,t,n,r){let i;if(Array.isArray(e[0])){let n=e.length*t;i=Array(n);for(let n=0;n<e.length;n++)for(let r=0;r<t;r++)i[n*t+r]=e[n][r]||0}else i=e;return n?ft(i,{size:t,gridResolution:n}):r?xt(i,{size:t}):i}var Lt=1,Rt=2,zt=4,Bt=class extends f{constructor(e){super({...e,attributes:{positions:{size:3,padding:18,initialize:!0,type:e.fp64?Float64Array:Float32Array},segmentTypes:{size:1,type:Uint8ClampedArray}}})}get(e){return this.attributes[e]}getGeometryFromBuffer(e){return this.normalize?super.getGeometryFromBuffer(e):null}normalizeGeometry(e){return this.normalize?It(e,this.positionSize,this.opts.resolution,this.opts.wrapLongitude):e}getGeometrySize(e){if(Vt(e)){let t=0;for(let n of e)t+=this.getGeometrySize(n);return t}let t=this.getPathLength(e);return t<2?0:this.isClosed(e)?t<3?0:t+2:t}updateGeometryAttributes(e,t){if(t.geometrySize!==0)if(e&&Vt(e))for(let n of e){let e=this.getGeometrySize(n);t.geometrySize=e,this.updateGeometryAttributes(n,t),t.vertexStart+=e}else this._updateSegmentTypes(e,t),this._updatePositions(e,t)}_updateSegmentTypes(e,t){let n=this.attributes.segmentTypes,r=e?this.isClosed(e):!1,{vertexStart:i,geometrySize:a}=t;n.fill(0,i,i+a),r?(n[i]=zt,n[i+a-2]=zt):(n[i]+=Lt,n[i+a-2]+=Rt),n[i+a-1]=zt}_updatePositions(e,t){let{positions:n}=this.attributes;if(!n||!e)return;let{vertexStart:r,geometrySize:i}=t,a=[,,,];for(let t=r,o=0;o<i;t++,o++)this.getPointOnPath(e,o,a),n[t*3]=a[0],n[t*3+1]=a[1],n[t*3+2]=a[2]}getPathLength(e){return e.length/this.positionSize}getPointOnPath(e,t,n=[]){let{positionSize:r}=this;t*r>=e.length&&(t+=1-e.length/r);let i=t*r;return n[0]=e[i],n[1]=e[i+1],n[2]=r===3&&e[i+2]||0,n}isClosed(e){if(!this.normalize)return!!this.opts.loop;let{positionSize:t}=this,n=e.length-t;return e[0]===e[n]&&e[1]===e[n+1]&&(t===2||e[2]===e[n+2])}};function Vt(e){return Array.isArray(e[0])}var Ht=`layout(std140) uniform pathUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float jointType;
  float capType;
  float miterLimit;
  bool billboard;
  highp int widthUnits;
} path;
`,Ut={name:`path`,vs:Ht,fs:Ht,uniformTypes:{widthScale:`f32`,widthMinPixels:`f32`,widthMaxPixels:`f32`,jointType:`f32`,capType:`f32`,miterLimit:`f32`,billboard:`f32`,widthUnits:`i32`}},Wt=`#version 300 es
#define SHADER_NAME path-layer-vertex-shader
in vec2 positions;
in float instanceTypes;
in vec3 instanceStartPositions;
in vec3 instanceEndPositions;
in vec3 instanceLeftPositions;
in vec3 instanceRightPositions;
in vec3 instanceLeftPositions64Low;
in vec3 instanceStartPositions64Low;
in vec3 instanceEndPositions64Low;
in vec3 instanceRightPositions64Low;
in float instanceStrokeWidths;
in vec4 instanceColors;
in vec3 instancePickingColors;
uniform float opacity;
out vec4 vColor;
out vec2 vCornerOffset;
out float vMiterLength;
out vec2 vPathPosition;
out float vPathLength;
out float vJointType;
const float EPSILON = 0.001;
const vec3 ZERO_OFFSET = vec3(0.0);
float flipIfTrue(bool flag) {
return -(float(flag) * 2. - 1.);
}
vec3 getLineJoinOffset(
vec3 prevPoint, vec3 currPoint, vec3 nextPoint,
vec2 width
) {
bool isEnd = positions.x > 0.0;
float sideOfPath = positions.y;
float isJoint = float(sideOfPath == 0.0);
vec3 deltaA3 = (currPoint - prevPoint);
vec3 deltaB3 = (nextPoint - currPoint);
mat3 rotationMatrix;
bool needsRotation = !path.billboard && project_needs_rotation(currPoint, rotationMatrix);
if (needsRotation) {
deltaA3 = deltaA3 * rotationMatrix;
deltaB3 = deltaB3 * rotationMatrix;
}
vec2 deltaA = deltaA3.xy / width;
vec2 deltaB = deltaB3.xy / width;
float lenA = length(deltaA);
float lenB = length(deltaB);
vec2 dirA = lenA > 0. ? normalize(deltaA) : vec2(0.0, 0.0);
vec2 dirB = lenB > 0. ? normalize(deltaB) : vec2(0.0, 0.0);
vec2 perpA = vec2(-dirA.y, dirA.x);
vec2 perpB = vec2(-dirB.y, dirB.x);
vec2 tangent = dirA + dirB;
tangent = length(tangent) > 0. ? normalize(tangent) : perpA;
vec2 miterVec = vec2(-tangent.y, tangent.x);
vec2 dir = isEnd ? dirA : dirB;
vec2 perp = isEnd ? perpA : perpB;
float L = isEnd ? lenA : lenB;
float sinHalfA = abs(dot(miterVec, perp));
float cosHalfA = abs(dot(dirA, miterVec));
float turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);
float cornerPosition = sideOfPath * turnDirection;
float miterSize = 1.0 / max(sinHalfA, EPSILON);
miterSize = mix(
min(miterSize, max(lenA, lenB) / max(cosHalfA, EPSILON)),
miterSize,
step(0.0, cornerPosition)
);
vec2 offsetVec = mix(miterVec * miterSize, perp, step(0.5, cornerPosition))
* (sideOfPath + isJoint * turnDirection);
bool isStartCap = lenA == 0.0 || (!isEnd && (instanceTypes == 1.0 || instanceTypes == 3.0));
bool isEndCap = lenB == 0.0 || (isEnd && (instanceTypes == 2.0 || instanceTypes == 3.0));
bool isCap = isStartCap || isEndCap;
if (isCap) {
offsetVec = mix(perp * sideOfPath, dir * path.capType * 4.0 * flipIfTrue(isStartCap), isJoint);
vJointType = path.capType;
} else {
vJointType = path.jointType;
}
vPathLength = L;
vCornerOffset = offsetVec;
vMiterLength = dot(vCornerOffset, miterVec * turnDirection);
vMiterLength = isCap ? isJoint : vMiterLength;
vec2 offsetFromStartOfPath = vCornerOffset + deltaA * float(isEnd);
vPathPosition = vec2(
dot(offsetFromStartOfPath, perp),
dot(offsetFromStartOfPath, dir)
);
geometry.uv = vPathPosition;
float isValid = step(instanceTypes, 3.5);
vec3 offset = vec3(offsetVec * width * isValid, 0.0);
if (needsRotation) {
offset = rotationMatrix * offset;
}
return offset;
}
void clipLine(inout vec4 position, vec4 refPosition) {
if (position.w < EPSILON) {
float r = (EPSILON - refPosition.w) / (position.w - refPosition.w);
position = refPosition + (position - refPosition) * r;
}
}
void main() {
geometry.pickingColor = instancePickingColors;
vColor = vec4(instanceColors.rgb, instanceColors.a * layer.opacity);
float isEnd = positions.x;
vec3 prevPosition = mix(instanceLeftPositions, instanceStartPositions, isEnd);
vec3 prevPosition64Low = mix(instanceLeftPositions64Low, instanceStartPositions64Low, isEnd);
vec3 currPosition = mix(instanceStartPositions, instanceEndPositions, isEnd);
vec3 currPosition64Low = mix(instanceStartPositions64Low, instanceEndPositions64Low, isEnd);
vec3 nextPosition = mix(instanceEndPositions, instanceRightPositions, isEnd);
vec3 nextPosition64Low = mix(instanceEndPositions64Low, instanceRightPositions64Low, isEnd);
geometry.worldPosition = currPosition;
vec2 widthPixels = vec2(clamp(
project_size_to_pixel(instanceStrokeWidths * path.widthScale, path.widthUnits),
path.widthMinPixels, path.widthMaxPixels) / 2.0);
vec3 width;
if (path.billboard) {
vec4 prevPositionScreen = project_position_to_clipspace(prevPosition, prevPosition64Low, ZERO_OFFSET);
vec4 currPositionScreen = project_position_to_clipspace(currPosition, currPosition64Low, ZERO_OFFSET, geometry.position);
vec4 nextPositionScreen = project_position_to_clipspace(nextPosition, nextPosition64Low, ZERO_OFFSET);
clipLine(prevPositionScreen, currPositionScreen);
clipLine(nextPositionScreen, currPositionScreen);
clipLine(currPositionScreen, mix(nextPositionScreen, prevPositionScreen, isEnd));
width = vec3(widthPixels, 0.0);
DECKGL_FILTER_SIZE(width, geometry);
vec3 offset = getLineJoinOffset(
prevPositionScreen.xyz / prevPositionScreen.w,
currPositionScreen.xyz / currPositionScreen.w,
nextPositionScreen.xyz / nextPositionScreen.w,
project_pixel_size_to_clipspace(width.xy)
);
DECKGL_FILTER_GL_POSITION(currPositionScreen, geometry);
gl_Position = vec4(currPositionScreen.xyz + offset * currPositionScreen.w, currPositionScreen.w);
} else {
prevPosition = project_position(prevPosition, prevPosition64Low);
currPosition = project_position(currPosition, currPosition64Low);
nextPosition = project_position(nextPosition, nextPosition64Low);
width = vec3(project_pixel_size(widthPixels), 0.0);
DECKGL_FILTER_SIZE(width, geometry);
vec3 offset = getLineJoinOffset(prevPosition, currPosition, nextPosition, width.xy);
geometry.position = vec4(currPosition + offset, 1.0);
gl_Position = project_common_position_to_clipspace(geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,Gt=`#version 300 es
#define SHADER_NAME path-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 vCornerOffset;
in float vMiterLength;
in vec2 vPathPosition;
in float vPathLength;
in float vJointType;
out vec4 fragColor;
void main(void) {
geometry.uv = vPathPosition;
if (vPathPosition.y < 0.0 || vPathPosition.y > vPathLength) {
if (vJointType > 0.5 && length(vCornerOffset) > 1.0) {
discard;
}
if (vJointType < 0.5 && vMiterLength > path.miterLimit + 1.0) {
discard;
}
}
fragColor = vColor;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,Kt=[0,0,0,255],qt={widthUnits:`meters`,widthScale:{type:`number`,min:0,value:1},widthMinPixels:{type:`number`,min:0,value:0},widthMaxPixels:{type:`number`,min:0,value:2**53-1},jointRounded:!1,capRounded:!1,miterLimit:{type:`number`,min:0,value:4},billboard:!1,_pathType:null,getPath:{type:`accessor`,value:e=>e.path},getColor:{type:`accessor`,value:Kt},getWidth:{type:`accessor`,value:1},rounded:{deprecatedFor:[`jointRounded`,`capRounded`]}},Jt={enter:(e,t)=>t.length?t.subarray(t.length-e.length):e},W=class extends a{getShaders(){return super.getShaders({vs:Wt,fs:Gt,modules:[h,l,Ut]})}get wrapLongitude(){return!1}getBounds(){return this.getAttributeManager()?.getBounds([`vertexPositions`])}initializeState(){this.getAttributeManager().addInstanced({vertexPositions:{size:3,vertexOffset:1,type:`float64`,fp64:this.use64bitPositions(),transition:Jt,accessor:`getPath`,update:this.calculatePositions,noAlloc:!0,shaderAttributes:{instanceLeftPositions:{vertexOffset:0},instanceStartPositions:{vertexOffset:1},instanceEndPositions:{vertexOffset:2},instanceRightPositions:{vertexOffset:3}}},instanceTypes:{size:1,type:`uint8`,update:this.calculateSegmentTypes,noAlloc:!0},instanceStrokeWidths:{size:1,accessor:`getWidth`,transition:Jt,defaultValue:1},instanceColors:{size:this.props.colorFormat.length,type:`unorm8`,accessor:`getColor`,transition:Jt,defaultValue:Kt},instancePickingColors:{size:4,type:`uint8`,accessor:(e,{index:t,target:n})=>this.encodePickingColor(e&&e.__source?e.__source.index:t,n)}}),this.setState({pathTesselator:new Bt({fp64:this.use64bitPositions()})})}updateState(e){super.updateState(e);let{props:t,changeFlags:n}=e,r=this.getAttributeManager();if(n.dataChanged||n.updateTriggersChanged&&(n.updateTriggersChanged.all||n.updateTriggersChanged.getPath)){let{pathTesselator:e}=this.state,i=t.data.attributes||{};e.updateGeometry({data:t.data,geometryBuffer:i.getPath,buffers:i,normalize:!t._pathType,loop:t._pathType===`loop`,getGeometry:t.getPath,positionFormat:t.positionFormat,wrapLongitude:t.wrapLongitude,resolution:this.context.viewport.resolution,dataChanged:n.dataChanged}),this.setState({numInstances:e.instanceCount,startIndices:e.vertexStarts}),n.dataChanged||r.invalidateAll()}n.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),r.invalidateAll())}getPickingInfo(e){let t=super.getPickingInfo(e),{index:n}=t,r=this.props.data;return r[0]&&r[0].__source&&(t.object=r.find(e=>e.__source.index===n)),t}disablePickingIndex(e){let t=this.props.data;if(t[0]&&t[0].__source)for(let n=0;n<t.length;n++)t[n].__source.index===e&&this._disablePickingIndex(n);else super.disablePickingIndex(e)}draw({uniforms:e}){let{jointRounded:t,capRounded:n,billboard:r,miterLimit:i,widthUnits:a,widthScale:o,widthMinPixels:s,widthMaxPixels:c}=this.props,l=this.state.model,u={jointType:Number(t),capType:Number(n),billboard:r,widthUnits:v[a],widthScale:o,miterLimit:i,widthMinPixels:s,widthMaxPixels:c};l.shaderInputs.setProps({path:u}),l.draw(this.context.renderPass)}_getModel(){let e=[0,1,2,1,4,2,1,3,4,3,5,4],t=[0,0,0,-1,0,1,1,-1,1,1,1,0];return new m(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new s({topology:`triangle-list`,attributes:{indices:new Uint16Array(e),positions:{value:new Float32Array(t),size:2}}}),isInstanced:!0})}calculatePositions(e){let{pathTesselator:t}=this.state;e.startIndices=t.vertexStarts,e.value=t.get(`positions`)}calculateSegmentTypes(e){let{pathTesselator:t}=this.state;e.startIndices=t.vertexStarts,e.value=t.get(`segmentTypes`)}};W.defaultProps=qt,W.layerName=`PathLayer`;var Yt=e(t(((e,t)=>{t.exports=n,t.exports.default=n;function n(e,t,n){n||=2;var i=t&&t.length,o=i?t[0]*n:e.length,s=r(e,0,o,n,!0),c=[];if(!s||s.next===s.prev)return c;var l,d,f,p,m,h,g;if(i&&(s=u(e,t,s,n)),e.length>80*n){l=f=e[0],d=p=e[1];for(var _=n;_<o;_+=n)m=e[_],h=e[_+1],m<l&&(l=m),h<d&&(d=h),m>f&&(f=m),h>p&&(p=h);g=Math.max(f-l,p-d),g=g===0?0:32767/g}return a(s,c,n,l,d,g,0),c}function r(e,t,n,r,i){var a,o;if(i===N(e,t,n,r)>0)for(a=t;a<n;a+=r)o=A(a,e[a],e[a+1],o);else for(a=n-r;a>=t;a-=r)o=A(a,e[a],e[a+1],o);return o&&S(o,o.next)&&(j(o),o=o.next),o}function i(e,t){if(!e)return e;t||=e;var n=e,r;do if(r=!1,!n.steiner&&(S(n,n.next)||x(n.prev,n,n.next)===0)){if(j(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function a(e,t,n,r,u,d,f){if(e){!f&&d&&h(e,r,u,d);for(var p=e,m,g;e.prev!==e.next;){if(m=e.prev,g=e.next,d?s(e,r,u,d):o(e)){t.push(m.i/n|0),t.push(e.i/n|0),t.push(g.i/n|0),j(e),e=g.next,p=g.next;continue}if(e=g,e===p){f?f===1?(e=c(i(e),t,n),a(e,t,n,r,u,d,2)):f===2&&l(e,t,n,r,u,d):a(i(e),t,n,r,u,d,1);break}}}}function o(e){var t=e.prev,n=e,r=e.next;if(x(t,n,r)>=0)return!1;for(var i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=i<a?i<o?i:o:a<o?a:o,d=s<c?s<l?s:l:c<l?c:l,f=i>a?i>o?i:o:a>o?a:o,p=s>c?s>l?s:l:c>l?c:l,m=r.next;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&y(i,s,a,c,o,l,m.x,m.y)&&x(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function s(e,t,n,r){var i=e.prev,a=e,o=e.next;if(x(i,a,o)>=0)return!1;for(var s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=s<c?s<l?s:l:c<l?c:l,m=u<d?u<f?u:f:d<f?d:f,h=s>c?s>l?s:l:c>l?c:l,g=u>d?u>f?u:f:d>f?d:f,v=_(p,m,t,n,r),b=_(h,g,t,n,r),S=e.prevZ,C=e.nextZ;S&&S.z>=v&&C&&C.z<=b;){if(S.x>=p&&S.x<=h&&S.y>=m&&S.y<=g&&S!==i&&S!==o&&y(s,u,c,d,l,f,S.x,S.y)&&x(S.prev,S,S.next)>=0||(S=S.prevZ,C.x>=p&&C.x<=h&&C.y>=m&&C.y<=g&&C!==i&&C!==o&&y(s,u,c,d,l,f,C.x,C.y)&&x(C.prev,C,C.next)>=0))return!1;C=C.nextZ}for(;S&&S.z>=v;){if(S.x>=p&&S.x<=h&&S.y>=m&&S.y<=g&&S!==i&&S!==o&&y(s,u,c,d,l,f,S.x,S.y)&&x(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;C&&C.z<=b;){if(C.x>=p&&C.x<=h&&C.y>=m&&C.y<=g&&C!==i&&C!==o&&y(s,u,c,d,l,f,C.x,C.y)&&x(C.prev,C,C.next)>=0)return!1;C=C.nextZ}return!0}function c(e,t,n){var r=e;do{var a=r.prev,o=r.next.next;!S(a,o)&&C(a,r,r.next,o)&&D(a,o)&&D(o,a)&&(t.push(a.i/n|0),t.push(r.i/n|0),t.push(o.i/n|0),j(r),j(r.next),r=e=o),r=r.next}while(r!==e);return i(r)}function l(e,t,n,r,o,s){var c=e;do{for(var l=c.next.next;l!==c.prev;){if(c.i!==l.i&&b(c,l)){var u=k(c,l);c=i(c,c.next),u=i(u,u.next),a(c,t,n,r,o,s,0),a(u,t,n,r,o,s,0);return}l=l.next}c=c.next}while(c!==e)}function u(e,t,n,i){var a=[],o,s,c,l,u;for(o=0,s=t.length;o<s;o++)c=t[o]*i,l=o<s-1?t[o+1]*i:e.length,u=r(e,c,l,i,!1),u===u.next&&(u.steiner=!0),a.push(v(u));for(a.sort(d),o=0;o<a.length;o++)n=f(a[o],n);return n}function d(e,t){return e.x-t.x}function f(e,t){var n=p(e,t);if(!n)return t;var r=k(n,e);return i(r,r.next),i(n,n.next)}function p(e,t){var n=t,r=e.x,i=e.y,a=-1/0,o;do{if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){var s=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(s<=r&&s>a&&(a=s,o=n.x<n.next.x?n:n.next,s===r))return o}n=n.next}while(n!==t);if(!o)return null;var c=o,l=o.x,u=o.y,d=1/0,f;n=o;do r>=n.x&&n.x>=l&&r!==n.x&&y(i<u?r:a,i,l,u,i<u?a:r,i,n.x,n.y)&&(f=Math.abs(i-n.y)/(r-n.x),D(n,e)&&(f<d||f===d&&(n.x>o.x||n.x===o.x&&m(o,n)))&&(o=n,d=f)),n=n.next;while(n!==c);return o}function m(e,t){return x(e.prev,e,t.prev)<0&&x(t.next,e,e.next)<0}function h(e,t,n,r){var i=e;do i.z===0&&(i.z=_(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,g(i)}function g(e){var t,n,r,i,a,o,s,c,l=1;do{for(n=e,e=null,a=null,o=0;n;){for(o++,r=n,s=0,t=0;t<l&&(s++,r=r.nextZ,r);t++);for(c=l;s>0||c>0&&r;)s!==0&&(c===0||!r||n.z<=r.z)?(i=n,n=n.nextZ,s--):(i=r,r=r.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;n=r}a.nextZ=null,l*=2}while(o>1);return e}function _(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function v(e){var t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function y(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function b(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!E(e,t)&&(D(e,t)&&D(t,e)&&O(e,t)&&(x(e.prev,e,t.prev)||x(e,t.prev,t))||S(e,t)&&x(e.prev,e,e.next)>0&&x(t.prev,t,t.next)>0)}function x(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function S(e,t){return e.x===t.x&&e.y===t.y}function C(e,t,n,r){var i=T(x(e,t,n)),a=T(x(e,t,r)),o=T(x(n,r,e)),s=T(x(n,r,t));return!!(i!==a&&o!==s||i===0&&w(e,n,t)||a===0&&w(e,r,t)||o===0&&w(n,e,r)||s===0&&w(n,t,r))}function w(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function T(e){return e>0?1:e<0?-1:0}function E(e,t){var n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&C(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function D(e,t){return x(e.prev,e,e.next)<0?x(e,t,e.next)>=0&&x(e,e.prev,t)>=0:x(e,t,e.prev)<0||x(e,e.next,t)<0}function O(e,t){var n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function k(e,t){var n=new M(e.i,e.x,e.y),r=new M(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function A(e,t,n,r){var i=new M(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function j(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function M(e,t,n){this.i=e,this.x=t,this.y=n,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}n.deviation=function(e,t,n,r){var i=t&&t.length,a=i?t[0]*n:e.length,o=Math.abs(N(e,0,a,n));if(i)for(var s=0,c=t.length;s<c;s++){var l=t[s]*n,u=s<c-1?t[s+1]*n:e.length;o-=Math.abs(N(e,l,u,n))}var d=0;for(s=0;s<r.length;s+=3){var f=r[s]*n,p=r[s+1]*n,m=r[s+2]*n;d+=Math.abs((e[f]-e[m])*(e[p+1]-e[f+1])-(e[f]-e[p])*(e[m+1]-e[f+1]))}return o===0&&d===0?0:Math.abs((d-o)/o)};function N(e,t,n,r){for(var i=0,a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}n.flatten=function(e){for(var t=e[0][0].length,n={vertices:[],holes:[],dimensions:t},r=0,i=0;i<e.length;i++){for(var a=0;a<e[i].length;a++)for(var o=0;o<t;o++)n.vertices.push(e[i][a][o]);i>0&&(r+=e[i-1].length,n.holes.push(r))}return n}}))(),1),Xt=it.CLOCKWISE,Zt=it.COUNTER_CLOCKWISE,G={isClosed:!0};function Qt(e){if(e=e&&e.positions||e,!Array.isArray(e)&&!ArrayBuffer.isView(e))throw Error(`invalid polygon`)}function K(e){return`positions`in e?e.positions:e}function q(e){return`holeIndices`in e?e.holeIndices:null}function $t(e){return Array.isArray(e[0])}function en(e){return e.length>=1&&e[0].length>=2&&Number.isFinite(e[0][0])}function tn(e){let t=e[0],n=e[e.length-1];return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]}function nn(e,t,n,r){for(let i=0;i<t;i++)if(e[n+i]!==e[r-t+i])return!1;return!0}function rn(e,t,n,r,i){let a=t,o=n.length;for(let t=0;t<o;t++)for(let i=0;i<r;i++)e[a++]=n[t][i]||0;if(!tn(n))for(let t=0;t<r;t++)e[a++]=n[0][t]||0;return G.start=t,G.end=a,G.size=r,at(e,i,G),a}function an(e,t,n,r,i=0,a,o){a||=n.length;let s=a-i;if(s<=0)return t;let c=t;for(let t=0;t<s;t++)e[c++]=n[i+t];if(!nn(n,r,i,a))for(let t=0;t<r;t++)e[c++]=n[i+t];return G.start=t,G.end=c,G.size=r,at(e,o,G),c}function on(e,t){Qt(e);let n=[],r=[];if(`positions`in e){let{positions:i,holeIndices:a}=e;if(a){let e=0;for(let o=0;o<=a.length;o++)e=an(n,e,i,t,a[o-1],a[o],o===0?Xt:Zt),r.push(e);return r.pop(),{positions:n,holeIndices:r}}e=i}if(!$t(e))return an(n,0,e,t,0,n.length,Xt),n;if(!en(e)){let i=0;for(let[a,o]of e.entries())i=rn(n,i,o,t,a===0?Xt:Zt),r.push(i);return r.pop(),{positions:n,holeIndices:r}}return rn(n,0,e,t,Xt),n}function sn(e,t,n){let r=e.length/3,i=0;for(let a=0;a<r;a++){let o=(a+1)%r;i+=e[a*3+t]*e[o*3+n],i-=e[o*3+t]*e[a*3+n]}return Math.abs(i/2)}function cn(e,t,n,r){let i=e.length/3;for(let a=0;a<i;a++){let i=a*3,o=e[i+0],s=e[i+1],c=e[i+2];e[i+t]=o,e[i+n]=s,e[i+r]=c}}function ln(e,t,n,r){let i=q(e);i&&=i.map(e=>e/t);let a=K(e),o=r&&t===3;if(n){let e=a.length;a=a.slice();let r=[];for(let i=0;i<e;i+=t){r[0]=a[i],r[1]=a[i+1],o&&(r[2]=a[i+2]);let e=n(r);a[i]=e[0],a[i+1]=e[1],o&&(a[i+2]=e[2])}}if(o){let e=sn(a,0,1),t=sn(a,0,2),r=sn(a,1,2);if(!e&&!t&&!r)return[];e>t&&e>r||(t>r?(n||(a=a.slice()),cn(a,0,2,1)):(n||(a=a.slice()),cn(a,2,0,1)))}return(0,Yt.default)(a,i,t)}var un=class extends f{constructor(e){let{fp64:t,IndexType:n=Uint32Array}=e;super({...e,attributes:{positions:{size:3,type:t?Float64Array:Float32Array},vertexValid:{type:Uint16Array,size:1},indices:{type:n,size:1}}})}get(e){let{attributes:t}=this;return e===`indices`?t.indices&&t.indices.subarray(0,this.vertexCount):t[e]}updateGeometry(e){super.updateGeometry(e);let t=this.buffers.indices;if(t)this.vertexCount=(t.value||t).length;else if(this.data&&!this.getGeometry)throw Error(`missing indices buffer`)}normalizeGeometry(e){if(this.normalize){let t=on(e,this.positionSize);return this.opts.resolution?ht(K(t),q(t),{size:this.positionSize,gridResolution:this.opts.resolution,edgeTypes:!0}):this.opts.wrapLongitude?St(K(t),q(t),{size:this.positionSize,maxLatitude:86,edgeTypes:!0}):t}return e}getGeometrySize(e){if(dn(e)){let t=0;for(let n of e)t+=this.getGeometrySize(n);return t}return K(e).length/this.positionSize}getGeometryFromBuffer(e){return this.normalize||!this.buffers.indices?super.getGeometryFromBuffer(e):null}updateGeometryAttributes(e,t){if(e&&dn(e))for(let n of e){let e=this.getGeometrySize(n);t.geometrySize=e,this.updateGeometryAttributes(n,t),t.vertexStart+=e,t.indexStart=this.indexStarts[t.geometryIndex+1]}else{let n=e;this._updateIndices(n,t),this._updatePositions(n,t),this._updateVertexValid(n,t)}}_updateIndices(e,{geometryIndex:t,vertexStart:n,indexStart:r}){let{attributes:i,indexStarts:a,typedArrayManager:o}=this,s=i.indices;if(!s||!e)return;let c=r,l=ln(e,this.positionSize,this.opts.preproject,this.opts.full3d);s=o.allocate(s,r+l.length,{copy:!0});for(let e=0;e<l.length;e++)s[c++]=l[e]+n;a[t+1]=r+l.length,i.indices=s}_updatePositions(e,{vertexStart:t,geometrySize:n}){let{attributes:{positions:r},positionSize:i}=this;if(!r||!e)return;let a=K(e);for(let e=t,o=0;o<n;e++,o++){let t=a[o*i],n=a[o*i+1],s=i>2?a[o*i+2]:0;r[e*3]=t,r[e*3+1]=n,r[e*3+2]=s}}_updateVertexValid(e,{vertexStart:t,geometrySize:n}){let{positionSize:r}=this,i=this.attributes.vertexValid,a=e&&q(e);if(e&&e.edgeTypes?i.set(e.edgeTypes,t):i.fill(1,t,t+n),a)for(let e=0;e<a.length;e++)i[t+a[e]/r-1]=0;i[t+n-1]=0}};function dn(e){return Array.isArray(e)&&e.length>0&&!Number.isFinite(e[0])}var fn=`layout(std140) uniform solidPolygonUniforms {
  bool extruded;
  bool isWireframe;
  float elevationScale;
} solidPolygon;
`,pn={name:`solidPolygon`,vs:fn,fs:fn,uniformTypes:{extruded:`f32`,isWireframe:`f32`,elevationScale:`f32`}},mn=`in vec4 fillColors;
in vec4 lineColors;
in vec3 pickingColors;
out vec4 vColor;
struct PolygonProps {
vec3 positions;
vec3 positions64Low;
vec3 normal;
float elevations;
};
vec3 project_offset_normal(vec3 vector) {
if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {
return normalize(vector * project.commonUnitsPerWorldUnit);
}
return project_normal(vector);
}
void calculatePosition(PolygonProps props) {
vec3 pos = props.positions;
vec3 pos64Low = props.positions64Low;
vec3 normal = props.normal;
vec4 colors = solidPolygon.isWireframe ? lineColors : fillColors;
geometry.worldPosition = props.positions;
geometry.pickingColor = pickingColors;
if (solidPolygon.extruded) {
pos.z += props.elevations * solidPolygon.elevationScale;
}
gl_Position = project_position_to_clipspace(pos, pos64Low, vec3(0.), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
if (solidPolygon.extruded) {
#ifdef IS_SIDE_VERTEX
normal = project_offset_normal(normal);
#else
normal = project_normal(normal);
#endif
geometry.normal = normal;
vec3 lightColor = lighting_getLightColor(colors.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
vColor = vec4(lightColor, colors.a * layer.opacity);
} else {
vColor = vec4(colors.rgb, colors.a * layer.opacity);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,hn=`\
#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader
in vec3 vertexPositions;
in vec3 vertexPositions64Low;
in float elevations;
${mn}
void main(void) {
PolygonProps props;
props.positions = vertexPositions;
props.positions64Low = vertexPositions64Low;
props.elevations = elevations;
props.normal = vec3(0.0, 0.0, 1.0);
calculatePosition(props);
}
`,gn=`\
#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader-side
#define IS_SIDE_VERTEX
in vec2 positions;
in vec3 vertexPositions;
in vec3 nextVertexPositions;
in vec3 vertexPositions64Low;
in vec3 nextVertexPositions64Low;
in float elevations;
in float instanceVertexValid;
${mn}
void main(void) {
if(instanceVertexValid < 0.5){
gl_Position = vec4(0.);
return;
}
PolygonProps props;
vec3 pos;
vec3 pos64Low;
vec3 nextPos;
vec3 nextPos64Low;
#if RING_WINDING_ORDER_CW == 1
pos = vertexPositions;
pos64Low = vertexPositions64Low;
nextPos = nextVertexPositions;
nextPos64Low = nextVertexPositions64Low;
#else
pos = nextVertexPositions;
pos64Low = nextVertexPositions64Low;
nextPos = vertexPositions;
nextPos64Low = vertexPositions64Low;
#endif
props.positions = mix(pos, nextPos, positions.x);
props.positions64Low = mix(pos64Low, nextPos64Low, positions.x);
props.normal = vec3(
pos.y - nextPos.y + (pos64Low.y - nextPos64Low.y),
nextPos.x - pos.x + (nextPos64Low.x - pos64Low.x),
0.0);
props.elevations = elevations * positions.y;
calculatePosition(props);
}
`,_n=`#version 300 es
#define SHADER_NAME solid-polygon-layer-fragment-shader
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(void) {
fragColor = vColor;
geometry.uv = vec2(0.);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,vn=[0,0,0,255],yn={filled:!0,extruded:!1,wireframe:!1,_normalize:!0,_windingOrder:`CW`,_full3d:!1,elevationScale:{type:`number`,min:0,value:1},getPolygon:{type:`accessor`,value:e=>e.polygon},getElevation:{type:`accessor`,value:1e3},getFillColor:{type:`accessor`,value:vn},getLineColor:{type:`accessor`,value:vn},material:!0},bn={enter:(e,t)=>t.length?t.subarray(t.length-e.length):e},J=class extends a{getShaders(e){return super.getShaders({vs:e===`top`?hn:gn,fs:_n,defines:{RING_WINDING_ORDER_CW:!this.props._normalize&&this.props._windingOrder===`CCW`?0:1},modules:[h,r,l,pn]})}get wrapLongitude(){return!1}getBounds(){return this.getAttributeManager()?.getBounds([`vertexPositions`])}initializeState(){let{viewport:e}=this.context,{coordinateSystem:t}=this.props,{_full3d:n}=this.props;e.isGeospatial&&t===`default`&&(t=`lnglat`);let r;t===`lnglat`&&(r=n?e.projectPosition.bind(e):e.projectFlat.bind(e)),this.setState({numInstances:0,polygonTesselator:new un({preproject:r,fp64:this.use64bitPositions(),IndexType:Uint32Array})});let i=this.getAttributeManager();i.remove([`instancePickingColors`]),i.add({indices:{size:1,isIndexed:!0,update:this.calculateIndices,noAlloc:!0},vertexPositions:{size:3,type:`float64`,stepMode:`dynamic`,fp64:this.use64bitPositions(),transition:bn,accessor:`getPolygon`,update:this.calculatePositions,noAlloc:!0,shaderAttributes:{nextVertexPositions:{vertexOffset:1}}},instanceVertexValid:{size:1,type:`uint16`,stepMode:`instance`,update:this.calculateVertexValid,noAlloc:!0},elevations:{size:1,stepMode:`dynamic`,transition:bn,accessor:`getElevation`},fillColors:{size:this.props.colorFormat.length,type:`unorm8`,stepMode:`dynamic`,transition:bn,accessor:`getFillColor`,defaultValue:vn},lineColors:{size:this.props.colorFormat.length,type:`unorm8`,stepMode:`dynamic`,transition:bn,accessor:`getLineColor`,defaultValue:vn},pickingColors:{size:4,type:`uint8`,stepMode:`dynamic`,accessor:(e,{index:t,target:n})=>this.encodePickingColor(e&&e.__source?e.__source.index:t,n)}})}getPickingInfo(e){let t=super.getPickingInfo(e),{index:n}=t,r=this.props.data;return r[0]&&r[0].__source&&(t.object=r.find(e=>e.__source.index===n)),t}disablePickingIndex(e){let t=this.props.data;if(t[0]&&t[0].__source)for(let n=0;n<t.length;n++)t[n].__source.index===e&&this._disablePickingIndex(n);else super.disablePickingIndex(e)}draw({uniforms:e}){let{extruded:t,filled:n,wireframe:r,elevationScale:i}=this.props,{topModel:a,sideModel:o,wireframeModel:s,polygonTesselator:c}=this.state,l={extruded:!!t,elevationScale:i,isWireframe:!1};s&&r&&(s.setInstanceCount(c.instanceCount-1),s.shaderInputs.setProps({solidPolygon:{...l,isWireframe:!0}}),s.draw(this.context.renderPass)),o&&n&&(o.setInstanceCount(c.instanceCount-1),o.shaderInputs.setProps({solidPolygon:l}),o.draw(this.context.renderPass)),a&&n&&(a.setVertexCount(c.vertexCount),a.shaderInputs.setProps({solidPolygon:l}),a.draw(this.context.renderPass))}updateState(e){super.updateState(e),this.updateGeometry(e);let{props:t,oldProps:n,changeFlags:r}=e,i=this.getAttributeManager();(r.extensionsChanged||t.filled!==n.filled||t.extruded!==n.extruded)&&(this.state.models?.forEach(e=>e.destroy()),this.setState(this._getModels()),i.invalidateAll())}updateGeometry({props:e,oldProps:t,changeFlags:n}){if(n.dataChanged||n.updateTriggersChanged&&(n.updateTriggersChanged.all||n.updateTriggersChanged.getPolygon)){let{polygonTesselator:t}=this.state,r=e.data.attributes||{};t.updateGeometry({data:e.data,normalize:e._normalize,geometryBuffer:r.getPolygon,buffers:r,getGeometry:e.getPolygon,positionFormat:e.positionFormat,wrapLongitude:e.wrapLongitude,resolution:this.context.viewport.resolution,fp64:this.use64bitPositions(),dataChanged:n.dataChanged,full3d:e._full3d}),this.setState({numInstances:t.instanceCount,startIndices:t.vertexStarts}),n.dataChanged||this.getAttributeManager().invalidateAll()}}_getModels(){let{id:e,filled:t,extruded:n}=this.props,r,i,a;if(t){let t=this.getShaders(`top`);t.defines.NON_INSTANCED_MODEL=1;let n=this.getAttributeManager().getBufferLayouts({isInstanced:!1});r=new m(this.context.device,{...t,id:`${e}-top`,topology:`triangle-list`,bufferLayout:n,isIndexed:!0,userData:{excludeAttributes:{instanceVertexValid:!0}}})}if(n){let t=this.getAttributeManager().getBufferLayouts({isInstanced:!0});i=new m(this.context.device,{...this.getShaders(`side`),id:`${e}-side`,bufferLayout:t,geometry:new s({topology:`triangle-strip`,attributes:{positions:{size:2,value:new Float32Array([1,0,0,0,1,1,0,1])}}}),isInstanced:!0,userData:{excludeAttributes:{indices:!0}}}),a=new m(this.context.device,{...this.getShaders(`side`),id:`${e}-wireframe`,bufferLayout:t,geometry:new s({topology:`line-strip`,attributes:{positions:{size:2,value:new Float32Array([1,0,0,0,0,1,1,1])}}}),isInstanced:!0,userData:{excludeAttributes:{indices:!0}}})}return{models:[i,a,r].filter(Boolean),topModel:r,sideModel:i,wireframeModel:a}}calculateIndices(e){let{polygonTesselator:t}=this.state;e.startIndices=t.indexStarts,e.value=t.get(`indices`)}calculatePositions(e){let{polygonTesselator:t}=this.state;e.startIndices=t.vertexStarts,e.value=t.get(`positions`)}calculateVertexValid(e){e.value=this.state.polygonTesselator.get(`vertexValid`)}};J.defaultProps=yn,J.layerName=`SolidPolygonLayer`;function xn({data:e,getIndex:t,dataRange:n,replace:r}){let{startRow:i=0,endRow:a=1/0}=n,o=e.length,s=o,c=o;for(let n=0;n<o;n++){let r=t(e[n]);if(s>n&&r>=i&&(s=n),r>=a){c=n;break}}let l=s,u=c-s===r.length?void 0:e.slice(c);for(let t=0;t<r.length;t++)e[l++]=r[t];if(u){for(let t=0;t<u.length;t++)e[l++]=u[t];e.length=l}return{startRow:s,endRow:s+r.length}}var Sn=[0,0,0,255],Cn={stroked:!0,filled:!0,extruded:!1,elevationScale:1,wireframe:!1,_normalize:!0,_windingOrder:`CW`,lineWidthUnits:`meters`,lineWidthScale:1,lineWidthMinPixels:0,lineWidthMaxPixels:2**53-1,lineJointRounded:!1,lineMiterLimit:4,getPolygon:{type:`accessor`,value:e=>e.polygon},getFillColor:{type:`accessor`,value:[0,0,0,255]},getLineColor:{type:`accessor`,value:Sn},getLineWidth:{type:`accessor`,value:1},getElevation:{type:`accessor`,value:1e3},material:!0},wn=class extends u{initializeState(){this.state={paths:[],pathsDiff:null},this.props.getLineDashArray&&g.removed(`getLineDashArray`,`PathStyleExtension`)()}updateState({changeFlags:e}){let t=e.dataChanged||e.updateTriggersChanged&&(e.updateTriggersChanged.all||e.updateTriggersChanged.getPolygon);if(t&&Array.isArray(e.dataChanged)){let t=this.state.paths.slice(),n=e.dataChanged.map(e=>xn({data:t,getIndex:e=>e.__source.index,dataRange:e,replace:this._getPaths(e)}));this.setState({paths:t,pathsDiff:n})}else t&&this.setState({paths:this._getPaths(),pathsDiff:null})}_getPaths(e={}){let{data:t,getPolygon:n,positionFormat:r,_normalize:i}=this.props,a=[],o=r===`XY`?2:3,{startRow:s,endRow:c}=e,{iterable:l,objectInfo:u}=p(t,s,c);for(let e of l){u.index++;let t=n(e,u);i&&(t=on(t,o));let{holeIndices:r}=t,s=t.positions||t;if(r)for(let t=0;t<=r.length;t++){let n=s.slice(r[t-1]||0,r[t]||s.length);a.push(this.getSubLayerRow({path:n},e,u.index))}else a.push(this.getSubLayerRow({path:s},e,u.index))}return a}renderLayers(){let{data:e,_dataDiff:t,stroked:n,filled:r,extruded:i,wireframe:a,_normalize:o,_windingOrder:s,elevationScale:c,transitions:l,positionFormat:u}=this.props,{lineWidthUnits:d,lineWidthScale:f,lineWidthMinPixels:p,lineWidthMaxPixels:m,lineJointRounded:h,lineMiterLimit:g,lineDashJustified:_}=this.props,{getFillColor:v,getLineColor:y,getLineWidth:b,getLineDashArray:x,getElevation:S,getPolygon:C,updateTriggers:w,material:T}=this.props,{paths:E,pathsDiff:D}=this.state,O=this.getSubLayerClass(`fill`,J),k=this.getSubLayerClass(`stroke`,W),A=this.shouldRenderSubLayer(`fill`,E)&&new O({_dataDiff:t,extruded:i,elevationScale:c,filled:r,wireframe:a,_normalize:o,_windingOrder:s,getElevation:S,getFillColor:v,getLineColor:i&&a?y:Sn,material:T,transitions:l},this.getSubLayerProps({id:`fill`,updateTriggers:w&&{getPolygon:w.getPolygon,getElevation:w.getElevation,getFillColor:w.getFillColor,lineColors:i&&a,getLineColor:w.getLineColor}}),{data:e,positionFormat:u,getPolygon:C}),j=!i&&n&&this.shouldRenderSubLayer(`stroke`,E)&&new k({_dataDiff:D&&(()=>D),widthUnits:d,widthScale:f,widthMinPixels:p,widthMaxPixels:m,jointRounded:h,miterLimit:g,dashJustified:_,_pathType:`loop`,transitions:l&&{getWidth:l.getLineWidth,getColor:l.getLineColor,getPath:l.getPolygon},getColor:this.getSubLayerAccessor(y),getWidth:this.getSubLayerAccessor(b),getDashArray:this.getSubLayerAccessor(x)},this.getSubLayerProps({id:`stroke`,updateTriggers:w&&{getWidth:w.getLineWidth,getColor:w.getLineColor,getDashArray:w.getLineDashArray}}),{data:E,positionFormat:u,getPath:e=>e.path});return[!i&&A,j,i&&A]}};wn.layerName=`PolygonLayer`,wn.defaultProps=Cn;function Tn(e,t){if(!e)return null;let n=`startIndices`in e?e.startIndices[t]:t,r=e.featureIds.value[n];return n===-1?null:En(e,r,n)}function En(e,t,n){let r={properties:{...e.properties[t]}};for(let t in e.numericProps)r.properties[t]=e.numericProps[t].value[n];return r}function Dn(e,t){let n={points:null,lines:null,polygons:null};for(let r in n){let i=e[r].globalFeatureIds.value;n[r]=new Uint8ClampedArray(i.length*4);let a=[];for(let e=0;e<i.length;e++)t(i[e],a),n[r][e*4+0]=a[0],n[r][e*4+1]=a[1],n[r][e*4+2]=a[2],n[r][e*4+3]=255}return n}var On=`layout(std140) uniform sdfUniforms {
  float gamma;
  bool enabled;
  float buffer;
  float outlineBuffer;
  vec4 outlineColor;
} sdf;
`,kn={name:`sdf`,vs:On,fs:On,uniformTypes:{gamma:`f32`,enabled:`f32`,buffer:`f32`,outlineBuffer:`f32`,outlineColor:`vec4<f32>`}},Y={none:0,start:1,center:2,end:3},An={name:`text`,vs:`\
layout(std140) uniform textUniforms {
  highp vec2 cutoffPixels;
  highp ivec2 align;
  highp float fontSize;
  bool flipY;
} text;

#define ALIGN_MODE_START ${Y.start}
#define ALIGN_MODE_CENTER ${Y.center}
#define ALIGN_MODE_END ${Y.end}
`,getUniforms:({contentCutoffPixels:e=[0,0],contentAlignHorizontal:t=`none`,contentAlignVertical:n=`none`,fontSize:r,viewport:i})=>({cutoffPixels:e,align:[Y[t],Y[n]],fontSize:r,flipY:i?.flipY??!1}),uniformTypes:{cutoffPixels:`vec2<f32>`,align:`vec2<i32>`,fontSize:`f32`,flipY:`f32`}},jn=`#version 300 es
#define SHADER_NAME multi-icon-layer-vertex-shader
in vec2 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceSizes;
in float instanceAngles;
in vec4 instanceColors;
in vec3 instancePickingColors;
in vec4 instanceIconFrames;
in float instanceColorModes;
in vec2 instanceOffsets;
in vec2 instancePixelOffset;
in vec4 instanceClipRect;
out float vColorMode;
out vec4 vColor;
out vec2 vTextureCoords;
out vec2 uv;
vec2 rotate_by_angle(vec2 vertex, float angle) {
float angle_radian = angle * PI / 180.0;
float cos_angle = cos(angle_radian);
float sin_angle = sin(angle_radian);
mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
return rotationMatrix * vertex;
}
float getPixelOffsetFromAlignment(float anchor, float extent, float clipStart, float clipEnd, int mode) {
if (clipEnd < clipStart) return 0.0;
if (mode == ALIGN_MODE_START) {
return max(- (anchor + clipStart), 0.0);
}
if (mode == ALIGN_MODE_CENTER) {
float _min = max(0., anchor + clipStart);
float _max = min(extent, anchor + clipEnd);
return _min < _max ? (_min + _max) / 2.0 - anchor : 0.0;
}
if (mode == ALIGN_MODE_END) {
return min(extent - (anchor + clipEnd), 0.);
}
return 0.0;
}
void main(void) {
geometry.worldPosition = instancePositions;
geometry.uv = positions;
geometry.pickingColor = instancePickingColors;
uv = positions;
vec2 iconSize = instanceIconFrames.zw;
float sizePixels = clamp(
project_size_to_pixel(instanceSizes * icon.sizeScale, icon.sizeUnits),
icon.sizeMinPixels, icon.sizeMaxPixels
);
float instanceScale = sizePixels / text.fontSize;
vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;
pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;
pixelOffset += instancePixelOffset;
pixelOffset.y *= -1.0;
vec2 anchorPosScreen;
if (icon.billboard)  {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
anchorPosScreen = gl_Position.xy / gl_Position.w;
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = vec3(pixelOffset, 0.0);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
if (text.flipY) {
offset_common.y *= -1.;
}
DECKGL_FILTER_SIZE(offset_common, geometry);
vec4 anchorPos = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0));
anchorPosScreen = anchorPos.xy / anchorPos.w;
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
anchorPosScreen = vec2(anchorPosScreen.x + 1.0, 1.0 - anchorPosScreen.y) / 2.0 * project.viewportSize / project.devicePixelRatio;
vec2 xy = project_size_to_pixel(instanceClipRect.xy);
vec2 wh = project_size_to_pixel(instanceClipRect.zw);
if (text.flipY) {
xy.y = -xy.y - wh.y;
}
if (text.align.x > 0 || text.align.y > 0) {
vec2 viewportPixels = project.viewportSize / project.devicePixelRatio;
vec2 scrollPixels = vec2(
getPixelOffsetFromAlignment(anchorPosScreen.x, viewportPixels.x, xy.x, xy.x + wh.x, text.align.x),
-getPixelOffsetFromAlignment(anchorPosScreen.y, viewportPixels.y, -xy.y - wh.y, -xy.y, text.align.y)
);
pixelOffset += scrollPixels;
gl_Position.xy += project_pixel_size_to_clipspace(scrollPixels);
}
if (instanceClipRect.z >= 0.) {
if (pixelOffset.x < xy.x || pixelOffset.x > xy.x + wh.x) {
gl_Position = vec4(0.0);
}
else if (text.cutoffPixels.x > 0.) {
float vpWidth = project.viewportSize.x / project.devicePixelRatio;
float l = max(anchorPosScreen.x + xy.x, 0.0);
float r = min(anchorPosScreen.x + xy.x + wh.x, vpWidth);
if (r - l < text.cutoffPixels.x) {
gl_Position = vec4(0.0);
}
}
}
if (instanceClipRect.w >= 0.) {
if (pixelOffset.y < xy.y || pixelOffset.y > xy.y + wh.y) {
gl_Position = vec4(0.0);
}
else if (text.cutoffPixels.y > 0.) {
float vpHeight = project.viewportSize.y / project.devicePixelRatio;
float t = max(anchorPosScreen.y - xy.y - wh.y, 0.0);
float b = min(anchorPosScreen.y - xy.y, vpHeight);
if (b - t < text.cutoffPixels.y) {
gl_Position = vec4(0.0);
}
}
}
vTextureCoords = mix(
instanceIconFrames.xy,
instanceIconFrames.xy + iconSize,
(positions.xy + 1.0) / 2.0
) / icon.iconsTextureDim;
vColor = instanceColors;
DECKGL_FILTER_COLOR(vColor, geometry);
vColorMode = instanceColorModes;
}
`,Mn=`#version 300 es
#define SHADER_NAME multi-icon-layer-fragment-shader
precision highp float;
uniform sampler2D iconsTexture;
in vec4 vColor;
in vec2 vTextureCoords;
in vec2 uv;
out vec4 fragColor;
void main(void) {
geometry.uv = uv;
if (!bool(picking.isActive)) {
float alpha = texture(iconsTexture, vTextureCoords).a;
vec4 color = vColor;
if (sdf.enabled) {
float distance = alpha;
alpha = smoothstep(sdf.buffer - sdf.gamma, sdf.buffer + sdf.gamma, distance);
if (sdf.outlineBuffer > 0.0) {
float inFill = alpha;
float inBorder = smoothstep(sdf.outlineBuffer - sdf.gamma, sdf.outlineBuffer + sdf.gamma, distance);
color = mix(sdf.outlineColor, vColor, inFill);
alpha = inBorder;
}
}
float a = alpha * color.a;
if (a < icon.alphaCutoff) {
discard;
}
fragColor = vec4(color.rgb, a * layer.opacity);
}
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,Nn=192/256,Pn={getIconOffsets:{type:`accessor`,value:e=>e.offsets},getContentBox:{type:`accessor`,value:[0,0,-1,-1]},fontSize:1,alphaCutoff:.001,smoothing:.1,outlineWidth:0,outlineColor:{type:`color`,value:[0,0,0,255]},contentCutoffPixels:{type:`array`,value:[0,0]},contentAlignHorizontal:`none`,contentAlignVertical:`none`},Fn=class extends I{getShaders(){let e=super.getShaders();return{...e,modules:[...e.modules,An,kn],vs:jn,fs:Mn}}initializeState(){super.initializeState();let e=this.getAttributeManager(),t=e.attributes.instanceIconDefs;t.settings.update=this.calculateInstanceIconDefs,e.addInstanced({instancePickingColors:{type:`uint8`,size:4,accessor:(e,{index:t,target:n})=>this.encodePickingColor(t,n)},instanceClipRect:{size:4,accessor:`getContentBox`,defaultValue:[0,0,-1,-1]}})}updateState(e){super.updateState(e);let{props:t,oldProps:n,changeFlags:r}=e,{outlineColor:i}=t;if(r.updateTriggersChanged&&(r.updateTriggersChanged.getIcon||r.updateTriggersChanged.getIconOffsets)&&this.getAttributeManager().invalidate(`instanceIconDefs`),i!==n.outlineColor){let e=[i[0]/255,i[1]/255,i[2]/255,(i[3]??255)/255];this.setState({outlineColor:e})}!t.sdf&&t.outlineWidth&&g.warn(`${this.id}: fontSettings.sdf is required to render outline`)()}draw(e){let{sdf:t,smoothing:n,fontSize:r,outlineWidth:i,contentCutoffPixels:a,contentAlignHorizontal:o,contentAlignVertical:s}=this.props,{outlineColor:c}=this.state,l=i?Math.max(n,Nn*(1-i)):-1,u=this.state.model,d={buffer:Nn,outlineBuffer:l,gamma:n,enabled:!!t,outlineColor:c},f={contentCutoffPixels:a,contentAlignHorizontal:o,contentAlignVertical:s,fontSize:r,viewport:this.context.viewport};if(u.shaderInputs.setProps({sdf:d,text:f}),super.draw(e),t&&i){let{iconManager:e}=this.state;e.getTexture()&&(u.shaderInputs.setProps({sdf:{...d,outlineBuffer:Nn}}),u.draw(this.context.renderPass))}}calculateInstanceIconDefs(e,{startRow:t,endRow:n}){let{data:r,getIcon:i,getIconOffsets:a}=this.props,o=e.getVertexOffset(t),s=e.value,{iterable:c,objectInfo:l}=p(r,t,n);for(let t of c){l.index++;let n=i(t,l),r=a(t,l);if(n){let t=0;for(let i of Array.from(n)){let n=super.getInstanceIconDef(i);n[0]=r[t*2],n[1]+=r[t*2+1],n[6]=1,s.set(n,o),o+=e.size,t++}}}}};Fn.defaultProps=Pn,Fn.layerName=`MultiIconLayer`;var X=0x56bc75e2d63100000,In=new Float64Array(256);for(let e=0;e<256;e++){let t=.5-(e/255)**(1/2.2);In[e]=t*Math.abs(t)}In[255]=-X;var Ln=class{constructor({fontSize:e=24,buffer:t=3,radius:n=8,cutoff:r=.25,fontFamily:i=`sans-serif`,fontWeight:a=`normal`,fontStyle:o=`normal`,lang:s=null}={}){this.buffer=t,this.radius=n,this.cutoff=r,this.lang=s;let c=this.size=e+t*4,l=this._createCanvas(c),u=this.ctx=l.getContext(`2d`,{willReadFrequently:!0});u.font=`${o} ${a} ${e}px ${i}`,u.textBaseline=`alphabetic`,u.textAlign=`left`,u.fillStyle=`black`,this.gridOuter=new Float64Array(c*c),this.gridInner=new Float64Array(c*c),this.f=new Float64Array(c),this.z=new Float64Array(c+1),this.v=new Uint16Array(c)}_createCanvas(e){if(typeof OffscreenCanvas<`u`)return new OffscreenCanvas(e,e);let t=document.createElement(`canvas`);return t.width=t.height=e,t}draw(e){let{width:t,actualBoundingBoxAscent:n,actualBoundingBoxDescent:r,actualBoundingBoxLeft:i,actualBoundingBoxRight:a}=this.ctx.measureText(e),o=Math.ceil(n),s=Math.floor(-i),c=Math.max(0,Math.min(this.size-this.buffer,Math.ceil(a)-s)),l=Math.max(0,Math.min(this.size-this.buffer,o+Math.ceil(r))),u=c+2*this.buffer,d=l+2*this.buffer,f=Math.max(u*d,0),p=new Uint8ClampedArray(f),m={data:p,width:u,height:d,glyphWidth:c,glyphHeight:l,glyphTop:o,glyphLeft:s,glyphAdvance:t};if(c===0||l===0)return m;let{ctx:h,buffer:g,gridInner:_,gridOuter:v}=this;this.lang&&(h.lang=this.lang),h.clearRect(g,g,c,l),h.fillText(e,g-s,g+o);let y=h.getImageData(g,g,c,l);v.fill(X,0,f),_.fill(0,0,f);let b=3;for(let e=0;e<l;e++){let t=(e+g)*u+g;for(let e=0;e<c;e++,b+=4,t++){let e=y.data[b];if(e===0)continue;let n=In[e];v[t]=Math.max(0,n),_[t]=Math.max(0,-n)}}Rn(v,0,0,u,d,u,this.f,this.v,this.z);let x=Math.min(g,1);Rn(_,g-x,g-x,c+2*x,l+2*x,u,this.f,this.v,this.z);let S=255/this.radius,C=255*(1-this.cutoff);for(let e=0;e<f;e++){let t=Math.sqrt(v[e])-Math.sqrt(_[e]);p[e]=Math.round(C-S*t)}return m}};function Rn(e,t,n,r,i,a,o,s,c){for(let l=t;l<t+r;l++)zn(e,n*a+l,a,i,o,s,c);for(let l=n;l<n+i;l++)zn(e,l*a+t,1,r,o,s,c)}function zn(e,t,n,r,i,a,o){a[0]=0,o[0]=-X,o[1]=X,i[0]=e[t];for(let s=1,c=0,l=0;s<r;s++){i[s]=e[t+s*n];let r=s*s;do{let e=a[c];l=(i[s]-i[e]+r-e*e)/(s-e)/2}while(l<=o[c]&&--c>-1);c++,a[c]=s,o[c]=l,o[c+1]=X}for(let s=0,c=0;s<r;s++){for(;o[c+1]<s;)c++;let r=a[c],l=s-r;e[t+s*n]=i[r]+l*l}}var Bn=32,Vn=[];function Hn(e){return 2**Math.ceil(Math.log2(e))}function Un({characterSet:e,measureText:t,buffer:n,maxCanvasWidth:r,mapping:i={},xOffset:a=0,yOffsetMin:o=0,yOffsetMax:s=0}){let c=a,l=o,u=s;for(let a of e)if(!i[a]){let{advance:e,width:o,ascent:s,descent:d}=t(a),f=s+d;c+o+n*2>r&&(c=0,l=u),i[a]={x:c+n,y:l+n,width:o,height:f,advance:e,anchorX:o/2,anchorY:s},c+=o+n*2,u=Math.max(u,l+f+n*2)}return{mapping:i,xOffset:c,yOffsetMin:l,yOffsetMax:u,canvasHeight:Hn(u)}}function Wn(e,t,n,r){let i=0;for(let a=t;a<n;a++){let t=e[a];i+=r[t]?.advance||0}return i}function Gn(e,t,n,r,i,a){let o=t,s=0;for(let c=t;c<n;c++){let t=Wn(e,c,c+1,i);s+t>r&&(o<c&&a.push(c),o=c,s=0),s+=t}return s}function Kn(e,t,n,r,i,a){let o=t,s=t,c=t,l=0;for(let u=t;u<n;u++)if((e[u]===` `||e[u+1]===` `||u+1===n)&&(c=u+1),c>s){let t=Wn(e,s,c,i);l+t>r&&(o<s&&(a.push(s),o=s,l=0),t>r&&(t=Gn(e,s,c,r,i,a),o=a[a.length-1])),s=c,l+=t}return l}function qn(e,t,n,r,i=0,a){a===void 0&&(a=e.length);let o=[];return t===`break-all`?Gn(e,i,a,n,r,o):Kn(e,i,a,n,r,o),o}function Jn(e,t,n,r,i,a){let o=0,s=0;for(let i=t;i<n;i++){let t=r[e[i]];t&&(s=Math.max(s,t.height))}for(let a=t;a<n;a++){let t=e[a],n=r[t];n?(i[a]=o+n.anchorX,o+=n.advance):(g.warn(`Missing character: ${t} (${t.codePointAt(0)})`)(),i[a]=o,o+=Bn)}a[0]=o,a[1]=s}function Yn(e,t,n,r,i,a){let o=Array.from(e),s=o.length,c=Array(s),l=Array(s),u=Array(s),d=(r===`break-word`||r===`break-all`)&&isFinite(i)&&i>0,f=[0,0],p=[0,0],m=0,h=t+n/2,g=0,_=0;for(let e=0;e<=s;e++){let t=o[e];if((t===`
`||e===s)&&(_=e),_>g){let e=d?qn(o,r,i,a,g,_):Vn;for(let t=0;t<=e.length;t++){let r=t===0?g:e[t-1],i=t<e.length?e[t]:_;Jn(o,r,i,a,c,p);for(let e=r;e<i;e++)l[e]=h,u[e]=p[0];m++,h+=n,f[0]=Math.max(f[0],p[0])}g=_}t===`
`&&(c[g]=0,l[g]=0,u[g]=0,g++)}return f[1]=m*n,{x:c,y:l,rowWidth:u,size:f}}function Xn({value:e,length:t,stride:n,offset:r,startIndices:i,characterSet:a}){let o=e.BYTES_PER_ELEMENT,s=n?n/o:1,c=r?r/o:0,l=i[t]||Math.ceil((e.length-c)/s),u=a&&new Set,d=Array(t),f=e;if(s>1||c>0){let t=e.constructor;f=new t(l);for(let t=0;t<l;t++)f[t]=e[t*s+c]}for(let e=0;e<t;e++){let t=i[e],n=i[e+1]||l,r=f.subarray(t,n);d[e]=String.fromCodePoint.apply(null,r),u&&r.forEach(u.add,u)}if(u)for(let e of u)a.add(String.fromCodePoint(e));return{texts:d,characterCount:l}}var Zn=class{constructor(e=5){this._cache={},this._order=[],this.limit=e}get(e){let t=this._cache[e];return t&&(this._deleteOrder(e),this._appendOrder(e)),t}set(e,t){this._cache[e]?(this.delete(e),this._cache[e]=t,this._appendOrder(e)):(Object.keys(this._cache).length===this.limit&&this.delete(this._order[0]),this._cache[e]=t,this._appendOrder(e))}delete(e){this._cache[e]&&(delete this._cache[e],this._deleteOrder(e))}_deleteOrder(e){let t=this._order.indexOf(e);t>=0&&this._order.splice(t,1)}_appendOrder(e){this._order.push(e)}};function Qn(){let e=[];for(let t=32;t<128;t++)e.push(String.fromCharCode(t));return e}var Z={fontFamily:`Monaco, monospace`,fontWeight:`normal`,characterSet:Qn(),fontSize:64,buffer:4,sdf:!1,cutoff:.25,radius:12,smoothing:.1},$n=1024,er=.9,tr=.3,nr=3,rr=new Zn(nr);function ir(e,t){let n;n=typeof t==`string`?new Set(Array.from(t)):new Set(t);let r=rr.get(e);if(!r)return n;for(let e in r.mapping)n.has(e)&&n.delete(e);return n}function ar(e,t){for(let n=0;n<e.length;n++)t.data[4*n+3]=e[n]}function or(e,t,n,r){e.font=`${r} ${n}px ${t}`,e.fillStyle=`#000`,e.textBaseline=`alphabetic`,e.textAlign=`left`}function sr(e,t,n){if(n===void 0){let n=e.measureText(`A`);return n.fontBoundingBoxAscent?{advance:0,width:0,ascent:Math.ceil(n.fontBoundingBoxAscent),descent:Math.ceil(n.fontBoundingBoxDescent)}:{advance:0,width:0,ascent:t*er,descent:t*tr}}let r=e.measureText(n);return r.actualBoundingBoxAscent?{advance:r.width,width:Math.ceil(r.actualBoundingBoxRight-r.actualBoundingBoxLeft),ascent:Math.ceil(r.actualBoundingBoxAscent),descent:Math.ceil(r.actualBoundingBoxDescent)}:{advance:r.width,width:r.width,ascent:t*er,descent:t*tr}}function cr(e){g.assert(Number.isFinite(e)&&e>=nr,`Invalid cache limit`),rr=new Zn(e)}var lr=class{constructor(){this.props={...Z}}get atlas(){return this._atlas}get mapping(){return this._atlas&&this._atlas.mapping}setProps(e={}){Object.assign(this.props,e),e._getFontRenderer&&(this._getFontRenderer=e._getFontRenderer),this._key=this._getKey();let t=ir(this._key,this.props.characterSet),n=rr.get(this._key);if(n&&t.size===0){this._atlas!==n&&(this._atlas=n);return}let r=this._generateFontAtlas(t,n);this._atlas=r,rr.set(this._key,r)}_generateFontAtlas(e,t){let{fontFamily:n,fontWeight:r,fontSize:i,buffer:a,sdf:o,radius:s,cutoff:c}=this.props,l=t&&t.data;l||(l=document.createElement(`canvas`),l.width=$n);let u=l.getContext(`2d`,{willReadFrequently:!0});or(u,n,i,r);let d=e=>sr(u,i,e),f;this._getFontRenderer?f=this._getFontRenderer(this.props):o&&(f={measure:d,draw:ur(this.props)});let{mapping:p,canvasHeight:m,xOffset:h,yOffsetMin:g,yOffsetMax:_}=Un({measureText:e=>f?f.measure(e):d(e),buffer:a,characterSet:e,maxCanvasWidth:$n,...t&&{mapping:t.mapping,xOffset:t.xOffset,yOffsetMin:t.yOffsetMin,yOffsetMax:t.yOffsetMax}});if(l.height!==m){let e=l.height>0?u.getImageData(0,0,l.width,l.height):null;l.height=m,e&&u.putImageData(e,0,0)}if(or(u,n,i,r),f)for(let t of e){let e=p[t],{data:n,left:r=0,top:i=0}=f.draw(t),a=e.x-r,o=e.y-i,s=Math.max(0,Math.round(a)),c=Math.max(0,Math.round(o)),d=Math.min(n.width,l.width-s),m=Math.min(n.height,l.height-c);u.putImageData(n,s,c,0,0,d,m),e.x+=s-a,e.y+=c-o}else for(let t of e){let e=p[t];u.fillText(t,e.x,e.y+e.anchorY)}let v=f?f.measure():d();return{baselineOffset:(v.ascent-v.descent)/2,xOffset:h,yOffsetMin:g,yOffsetMax:_,mapping:p,data:l,width:l.width,height:l.height}}_getKey(){let{fontFamily:e,fontWeight:t,fontSize:n,buffer:r,sdf:i,radius:a,cutoff:o}=this.props;return i?`${e} ${t} ${n} ${r} ${a} ${o}`:`${e} ${t} ${n} ${r}`}};function ur({fontSize:e,buffer:t,radius:n,cutoff:r,fontFamily:i,fontWeight:a}){let o=new Ln({fontSize:e,buffer:t,radius:n,cutoff:r,fontFamily:i,fontWeight:`${a}`});return e=>{let{data:n,width:r,height:i}=o.draw(e),a=new ImageData(r,i);return ar(n,a),{data:a,left:t,top:t}}}var dr=`layout(std140) uniform textBackgroundUniforms {
  bool billboard;
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  vec4 borderRadius;
  vec4 padding;
  highp int sizeUnits;
  bool stroked;
} textBackground;
`,fr={name:`textBackground`,vs:dr,fs:dr,uniformTypes:{billboard:`f32`,sizeScale:`f32`,sizeMinPixels:`f32`,sizeMaxPixels:`f32`,borderRadius:`vec4<f32>`,padding:`vec4<f32>`,sizeUnits:`i32`,stroked:`f32`}},pr=`#version 300 es
#define SHADER_NAME text-background-layer-vertex-shader
in vec2 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceRects;
in vec4 instanceClipRect;
in float instanceSizes;
in float instanceAngles;
in vec2 instancePixelOffsets;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in vec3 instancePickingColors;
out vec4 vFillColor;
out vec4 vLineColor;
out float vLineWidth;
out vec2 uv;
out vec2 dimensions;
vec2 rotate_by_angle(vec2 vertex, float angle) {
float angle_radian = radians(angle);
float cos_angle = cos(angle_radian);
float sin_angle = sin(angle_radian);
mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
return rotationMatrix * vertex;
}
void main(void) {
geometry.worldPosition = instancePositions;
geometry.uv = positions;
geometry.pickingColor = instancePickingColors;
uv = positions;
vLineWidth = instanceLineWidths;
float sizePixels = clamp(
project_size_to_pixel(instanceSizes * textBackground.sizeScale, textBackground.sizeUnits),
textBackground.sizeMinPixels, textBackground.sizeMaxPixels
);
float instanceScale = sizePixels / text.fontSize;
dimensions = instanceRects.zw * instanceScale + textBackground.padding.xy + textBackground.padding.zw;
vec2 pixelOffset = (positions * instanceRects.zw + instanceRects.xy) * instanceScale + mix(-textBackground.padding.xy, textBackground.padding.zw, positions);
pixelOffset = rotate_by_angle(pixelOffset, instanceAngles);
pixelOffset += instancePixelOffsets;
pixelOffset.y *= -1.0;
vec2 xy = project_size_to_pixel(instanceClipRect.xy);
vec2 wh = project_size_to_pixel(instanceClipRect.zw);
if (text.flipY) {
xy.y = -xy.y - wh.y;
}
if (instanceClipRect.z >= 0.0) {
dimensions.x = wh.x;
pixelOffset.x = xy.x + uv.x * wh.x + mix(-textBackground.padding.x, textBackground.padding.z, uv.x);
}
if (instanceClipRect.w >= 0.0) {
dimensions.y = wh.y;
pixelOffset.y = xy.y + uv.y * wh.y + mix(-textBackground.padding.y, textBackground.padding.w, uv.y);
}
if (textBackground.billboard)  {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = vec3(pixelOffset, 0.0);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
if (text.flipY) {
offset_common.y *= -1.;
}
DECKGL_FILTER_SIZE(offset_common, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vFillColor, geometry);
vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`,mr=`#version 300 es
#define SHADER_NAME text-background-layer-fragment-shader
precision highp float;
in vec4 vFillColor;
in vec4 vLineColor;
in float vLineWidth;
in vec2 uv;
in vec2 dimensions;
out vec4 fragColor;
float round_rect(vec2 p, vec2 size, vec4 radii) {
vec2 pixelPositionCB = (p - 0.5) * size;
vec2 sizeCB = size * 0.5;
float maxBorderRadius = min(size.x, size.y) * 0.5;
vec4 borderRadius = vec4(min(radii, maxBorderRadius));
borderRadius.xy =
(pixelPositionCB.x > 0.0) ? borderRadius.xy : borderRadius.zw;
borderRadius.x = (pixelPositionCB.y > 0.0) ? borderRadius.x : borderRadius.y;
vec2 q = abs(pixelPositionCB) - sizeCB + borderRadius.x;
return -(min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - borderRadius.x);
}
float rect(vec2 p, vec2 size) {
vec2 pixelPosition = p * size;
return min(min(pixelPosition.x, size.x - pixelPosition.x),
min(pixelPosition.y, size.y - pixelPosition.y));
}
vec4 get_stroked_fragColor(float dist) {
float isBorder = smoothedge(dist, vLineWidth);
return mix(vFillColor, vLineColor, isBorder);
}
void main(void) {
geometry.uv = uv;
if (textBackground.borderRadius != vec4(0.0)) {
float distToEdge = round_rect(uv, dimensions, textBackground.borderRadius);
float shapeAlpha = smoothedge(-distToEdge, 0.0);
if (shapeAlpha == 0.0) {
discard;
}
if (textBackground.stroked) {
fragColor = get_stroked_fragColor(distToEdge);
} else {
fragColor = vFillColor;
}
fragColor.a *= shapeAlpha;
} else {
if (textBackground.stroked) {
float distToEdge = rect(uv, dimensions);
fragColor = get_stroked_fragColor(distToEdge);
} else {
fragColor = vFillColor;
}
}
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,hr={billboard:!0,sizeScale:1,sizeUnits:`pixels`,sizeMinPixels:0,sizeMaxPixels:2**53-1,fontSize:1,borderRadius:{type:`object`,value:0},padding:{type:`array`,value:[0,0,0,0]},getPosition:{type:`accessor`,value:e=>e.position},getSize:{type:`accessor`,value:1},getAngle:{type:`accessor`,value:0},getPixelOffset:{type:`accessor`,value:[0,0]},getBoundingRect:{type:`accessor`,value:[0,0,0,0]},getClipRect:{type:`accessor`,value:[0,0,-1,-1]},getFillColor:{type:`accessor`,value:[0,0,0,255]},getLineColor:{type:`accessor`,value:[0,0,0,255]},getLineWidth:{type:`accessor`,value:1}},Q=class extends a{getShaders(){return super.getShaders({vs:pr,fs:mr,modules:[h,l,fr,An]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:3,type:`float64`,fp64:this.use64bitPositions(),transition:!0,accessor:`getPosition`},instanceSizes:{size:1,transition:!0,accessor:`getSize`,defaultValue:1},instanceAngles:{size:1,transition:!0,accessor:`getAngle`},instanceRects:{size:4,accessor:`getBoundingRect`},instanceClipRect:{size:4,accessor:`getClipRect`,defaultValue:[0,0,-1,-1]},instancePixelOffsets:{size:2,transition:!0,accessor:`getPixelOffset`},instanceFillColors:{size:4,transition:!0,type:`unorm8`,accessor:`getFillColor`,defaultValue:[0,0,0,255]},instanceLineColors:{size:4,transition:!0,type:`unorm8`,accessor:`getLineColor`,defaultValue:[0,0,0,255]},instanceLineWidths:{size:1,transition:!0,accessor:`getLineWidth`,defaultValue:1}})}updateState(e){super.updateState(e);let{changeFlags:t}=e;t.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:e}){let{billboard:t,sizeScale:n,sizeUnits:r,sizeMinPixels:i,sizeMaxPixels:a,getLineWidth:o,fontSize:s}=this.props,{padding:c,borderRadius:l}=this.props;c.length<4&&(c=[c[0],c[1],c[0],c[1]]),Array.isArray(l)||(l=[l,l,l,l]);let u=this.state.model,d={billboard:t,stroked:!!o,borderRadius:l,padding:c,sizeUnits:v[r],sizeScale:n,sizeMinPixels:i,sizeMaxPixels:a},f={fontSize:s,viewport:this.context.viewport};u.shaderInputs.setProps({textBackground:d,text:f}),u.draw(this.context.renderPass)}_getModel(){let e=[0,0,1,0,0,1,1,1];return new m(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new s({topology:`triangle-strip`,vertexCount:4,attributes:{positions:{size:2,value:new Float32Array(e)}}}),isInstanced:!0})}};Q.defaultProps=hr,Q.layerName=`TextBackgroundLayer`;var gr={start:1,middle:0,end:-1},_r={top:1,center:0,bottom:-1},vr=[0,0,0,255],yr={billboard:!0,sizeScale:1,sizeUnits:`pixels`,sizeMinPixels:0,sizeMaxPixels:2**53-1,background:!1,getBackgroundColor:{type:`accessor`,value:[255,255,255,255]},getBorderColor:{type:`accessor`,value:vr},getBorderWidth:{type:`accessor`,value:0},backgroundBorderRadius:{type:`object`,value:0},backgroundPadding:{type:`array`,value:[0,0,0,0]},characterSet:{type:`object`,value:Z.characterSet},fontFamily:Z.fontFamily,fontWeight:Z.fontWeight,lineHeight:1,outlineWidth:{type:`number`,value:0,min:0},outlineColor:{type:`color`,value:vr},fontSettings:{type:`object`,value:{},compare:1},wordBreak:`break-word`,maxWidth:{type:`number`,value:-1},contentCutoffPixels:{type:`array`,value:[0,0]},contentAlignHorizontal:`none`,contentAlignVertical:`none`,getText:{type:`accessor`,value:e=>e.text},getPosition:{type:`accessor`,value:e=>e.position},getColor:{type:`accessor`,value:vr},getSize:{type:`accessor`,value:32},getAngle:{type:`accessor`,value:0},getTextAnchor:{type:`accessor`,value:`middle`},getAlignmentBaseline:{type:`accessor`,value:`center`},getPixelOffset:{type:`accessor`,value:[0,0]},getContentBox:{type:`accessor`,value:[0,0,-1,-1]},backgroundColor:{deprecatedFor:[`background`,`getBackgroundColor`]}},br=class extends u{constructor(){super(...arguments),this.getBoundingRect=(e,t)=>{let{size:[n,r]}=this.transformParagraph(e,t),{getTextAnchor:i,getAlignmentBaseline:a}=this.props,o=gr[typeof i==`function`?i(e,t):i],s=_r[typeof a==`function`?a(e,t):a];return[(o-1)*n/2,(s-1)*r/2,n,r]},this.getIconOffsets=(e,t)=>{let{getTextAnchor:n,getAlignmentBaseline:r}=this.props,{x:i,y:a,rowWidth:o,size:[,s]}=this.transformParagraph(e,t),c=gr[typeof n==`function`?n(e,t):n],l=_r[typeof r==`function`?r(e,t):r],u=i.length,d=Array(u*2),f=0;for(let e=0;e<u;e++)d[f++]=(c-1)*o[e]/2+i[e],d[f++]=(l-1)*s/2+a[e];return d}}initializeState(){this.state={styleVersion:0,fontAtlasManager:new lr},this.props.maxWidth>0&&g.once(1,`v8.9 breaking change: TextLayer maxWidth is now relative to text size`)()}updateState(e){let{props:t,oldProps:n,changeFlags:r}=e;(r.dataChanged||r.updateTriggersChanged&&(r.updateTriggersChanged.all||r.updateTriggersChanged.getText))&&this._updateText(),(this._updateFontAtlas()||t.lineHeight!==n.lineHeight||t.wordBreak!==n.wordBreak||t.maxWidth!==n.maxWidth)&&this.setState({styleVersion:this.state.styleVersion+1})}getPickingInfo({info:e}){return e.object=e.index>=0?this.props.data[e.index]:null,e}_updateFontAtlas(){let{fontSettings:e,fontFamily:t,fontWeight:n,_getFontRenderer:r}=this.props,{fontAtlasManager:i,characterSet:a}=this.state,o={...e,characterSet:a,fontFamily:t,fontWeight:n,_getFontRenderer:r};if(!i.mapping)return i.setProps(o),!0;for(let e in o)if(o[e]!==i.props[e])return i.setProps(o),!0;return!1}_updateText(){let{data:e,characterSet:t}=this.props,n=e.attributes?.getText,{getText:r}=this.props,i=e.startIndices,a,o=t===`auto`&&new Set;if(n&&i){let{texts:t,characterCount:s}=Xn({...ArrayBuffer.isView(n)?{value:n}:n,length:e.length,startIndices:i,characterSet:o});a=s,r=(e,{index:n})=>t[n]}else{let{iterable:t,objectInfo:n}=p(e);i=[0],a=0;for(let e of t){n.index++;let t=Array.from(r(e,n)||``);o&&t.forEach(o.add,o),a+=t.length,i.push(a)}}this.setState({getText:r,startIndices:i,numInstances:a,characterSet:o||t})}transformParagraph(e,t){let{fontAtlasManager:n}=this.state,r=n.mapping,{baselineOffset:i}=n.atlas,{fontSize:a}=n.props,o=this.state.getText,{wordBreak:s,lineHeight:c,maxWidth:l}=this.props;return Yn(o(e,t)||``,i,c*a,s,l*a,r)}renderLayers(){let{startIndices:e,numInstances:t,getText:n,fontAtlasManager:{atlas:r,mapping:i},styleVersion:a}=this.state,{data:o,_dataDiff:s,getPosition:c,getColor:l,getSize:u,getAngle:d,getPixelOffset:f,getBackgroundColor:p,getBorderColor:m,getBorderWidth:h,getContentBox:g,backgroundBorderRadius:_,backgroundPadding:v,background:y,billboard:b,fontSettings:x,outlineWidth:S,outlineColor:C,sizeScale:w,sizeUnits:T,sizeMinPixels:E,sizeMaxPixels:D,contentCutoffPixels:O,contentAlignHorizontal:k,contentAlignVertical:A,transitions:j,updateTriggers:M}=this.props,N=this.getSubLayerClass(`characters`,Fn),ee=this.getSubLayerClass(`background`,Q),{fontSize:P}=this.state.fontAtlasManager.props;return[y&&new ee({getFillColor:p,getLineColor:m,getLineWidth:h,borderRadius:_,padding:v,getPosition:c,getSize:u,getAngle:d,getPixelOffset:f,getClipRect:g,billboard:b,sizeScale:w,sizeUnits:T,sizeMinPixels:E,sizeMaxPixels:D,fontSize:P,transitions:j&&{getPosition:j.getPosition,getAngle:j.getAngle,getSize:j.getSize,getFillColor:j.getBackgroundColor,getLineColor:j.getBorderColor,getLineWidth:j.getBorderWidth,getPixelOffset:j.getPixelOffset}},this.getSubLayerProps({id:`background`,updateTriggers:{getPosition:M.getPosition,getAngle:M.getAngle,getSize:M.getSize,getFillColor:M.getBackgroundColor,getLineColor:M.getBorderColor,getLineWidth:M.getBorderWidth,getPixelOffset:M.getPixelOffset,getBoundingRect:{getText:M.getText,getTextAnchor:M.getTextAnchor,getAlignmentBaseline:M.getAlignmentBaseline,styleVersion:a}}}),{data:o.attributes&&o.attributes.background?{length:o.length,attributes:o.attributes.background}:o,_dataDiff:s,autoHighlight:!1,getBoundingRect:this.getBoundingRect}),new N({sdf:x.sdf,smoothing:Number.isFinite(x.smoothing)?x.smoothing:Z.smoothing,outlineWidth:S/(x.radius||Z.radius),outlineColor:C,iconAtlas:r,iconMapping:i,getPosition:c,getColor:l,getSize:u,getAngle:d,getPixelOffset:f,getContentBox:g,billboard:b,sizeScale:w,sizeUnits:T,sizeMinPixels:E,sizeMaxPixels:D,fontSize:P,contentCutoffPixels:O,contentAlignHorizontal:k,contentAlignVertical:A,transitions:j&&{getPosition:j.getPosition,getAngle:j.getAngle,getColor:j.getColor,getSize:j.getSize,getPixelOffset:j.getPixelOffset,getContentBox:j.getContentBox}},this.getSubLayerProps({id:`characters`,updateTriggers:{all:M.getText,getPosition:M.getPosition,getAngle:M.getAngle,getColor:M.getColor,getSize:M.getSize,getPixelOffset:M.getPixelOffset,getContentBox:M.getContentBox,getIconOffsets:{getTextAnchor:M.getTextAnchor,getAlignmentBaseline:M.getAlignmentBaseline,styleVersion:a}}}),{data:o,_dataDiff:s,startIndices:e,numInstances:t,getIconOffsets:this.getIconOffsets,getIcon:n})]}static set fontAtlasCacheLimit(e){cr(e)}};br.defaultProps=yr,br.layerName=`TextLayer`;var xr={circle:{type:L,props:{filled:`filled`,stroked:`stroked`,lineWidthMaxPixels:`lineWidthMaxPixels`,lineWidthMinPixels:`lineWidthMinPixels`,lineWidthScale:`lineWidthScale`,lineWidthUnits:`lineWidthUnits`,pointRadiusMaxPixels:`radiusMaxPixels`,pointRadiusMinPixels:`radiusMinPixels`,pointRadiusScale:`radiusScale`,pointRadiusUnits:`radiusUnits`,pointAntialiasing:`antialiasing`,pointBillboard:`billboard`,getFillColor:`getFillColor`,getLineColor:`getLineColor`,getLineWidth:`getLineWidth`,getPointRadius:`getRadius`}},icon:{type:I,props:{iconAtlas:`iconAtlas`,iconMapping:`iconMapping`,iconSizeMaxPixels:`sizeMaxPixels`,iconSizeMinPixels:`sizeMinPixels`,iconSizeScale:`sizeScale`,iconSizeUnits:`sizeUnits`,iconAlphaCutoff:`alphaCutoff`,iconBillboard:`billboard`,getIcon:`getIcon`,getIconAngle:`getAngle`,getIconColor:`getColor`,getIconPixelOffset:`getPixelOffset`,getIconSize:`getSize`}},text:{type:br,props:{textSizeMaxPixels:`sizeMaxPixels`,textSizeMinPixels:`sizeMinPixels`,textSizeScale:`sizeScale`,textSizeUnits:`sizeUnits`,textBackground:`background`,textBackgroundPadding:`backgroundPadding`,textFontFamily:`fontFamily`,textFontWeight:`fontWeight`,textLineHeight:`lineHeight`,textMaxWidth:`maxWidth`,textOutlineColor:`outlineColor`,textOutlineWidth:`outlineWidth`,textWordBreak:`wordBreak`,textCharacterSet:`characterSet`,textBillboard:`billboard`,textFontSettings:`fontSettings`,getText:`getText`,getTextAngle:`getAngle`,getTextColor:`getColor`,getTextPixelOffset:`getPixelOffset`,getTextSize:`getSize`,getTextAnchor:`getTextAnchor`,getTextAlignmentBaseline:`getAlignmentBaseline`,getTextBackgroundColor:`getBackgroundColor`,getTextBorderColor:`getBorderColor`,getTextBorderWidth:`getBorderWidth`}}},Sr={type:W,props:{lineWidthUnits:`widthUnits`,lineWidthScale:`widthScale`,lineWidthMinPixels:`widthMinPixels`,lineWidthMaxPixels:`widthMaxPixels`,lineJointRounded:`jointRounded`,lineCapRounded:`capRounded`,lineMiterLimit:`miterLimit`,lineBillboard:`billboard`,getLineColor:`getColor`,getLineWidth:`getWidth`}},Cr={type:J,props:{extruded:`extruded`,filled:`filled`,wireframe:`wireframe`,elevationScale:`elevationScale`,material:`material`,_full3d:`_full3d`,getElevation:`getElevation`,getFillColor:`getFillColor`,getLineColor:`getLineColor`}};function $({type:e,props:t}){let n={};for(let r in t)n[r]=e.defaultProps[t[r]];return n}function wr(e,t){let{transitions:n,updateTriggers:r}=e.props,i={updateTriggers:{},transitions:n&&{getPosition:n.geometry}};for(let a in t){let o=t[a],s=e.props[a];a.startsWith(`get`)&&(s=e.getSubLayerAccessor(s),i.updateTriggers[o]=r[a],n&&(i.transitions[o]=n[a])),i[o]=s}return i}function Tr(e){if(Array.isArray(e))return e;switch(g.assert(e.type,`GeoJSON does not have type`),e.type){case`Feature`:return[e];case`FeatureCollection`:return g.assert(Array.isArray(e.features),`GeoJSON does not have features array`),e.features;default:return[{geometry:e}]}}function Er(e,t,n={}){let r={pointFeatures:[],lineFeatures:[],polygonFeatures:[],polygonOutlineFeatures:[]},{startRow:i=0,endRow:a=e.length}=n;for(let n=i;n<a;n++){let i=e[n],{geometry:a}=i;if(a)if(a.type===`GeometryCollection`){g.assert(Array.isArray(a.geometries),`GeoJSON does not have geometries array`);let{geometries:e}=a;for(let a=0;a<e.length;a++){let o=e[a];Dr(o,r,t,i,n)}}else Dr(a,r,t,i,n)}return r}function Dr(e,t,n,r,i){let{type:a,coordinates:o}=e,{pointFeatures:s,lineFeatures:c,polygonFeatures:l,polygonOutlineFeatures:u}=t;if(!kr(a,o)){g.warn(`${a} coordinates are malformed`)();return}switch(a){case`Point`:s.push(n({geometry:e},r,i));break;case`MultiPoint`:o.forEach(e=>{s.push(n({geometry:{type:`Point`,coordinates:e}},r,i))});break;case`LineString`:c.push(n({geometry:e},r,i));break;case`MultiLineString`:o.forEach(e=>{c.push(n({geometry:{type:`LineString`,coordinates:e}},r,i))});break;case`Polygon`:l.push(n({geometry:e},r,i)),o.forEach(e=>{u.push(n({geometry:{type:`LineString`,coordinates:e}},r,i))});break;case`MultiPolygon`:o.forEach(e=>{l.push(n({geometry:{type:`Polygon`,coordinates:e}},r,i)),e.forEach(e=>{u.push(n({geometry:{type:`LineString`,coordinates:e}},r,i))})});break;default:}}var Or={Point:1,MultiPoint:2,LineString:2,MultiLineString:3,Polygon:3,MultiPolygon:4};function kr(e,t){let n=Or[e];for(g.assert(n,`Unknown GeoJSON type ${e}`);t&&--n>0;)t=t[0];return t&&Number.isFinite(t[0])}function Ar(){return{points:{},lines:{},polygons:{},polygonsOutline:{}}}function jr(e){return e.geometry.coordinates}function Mr(e,t){let n=Ar(),{pointFeatures:r,lineFeatures:i,polygonFeatures:a,polygonOutlineFeatures:o}=e;return n.points.data=r,n.points._dataDiff=t.pointFeatures&&(()=>t.pointFeatures),n.points.getPosition=jr,n.lines.data=i,n.lines._dataDiff=t.lineFeatures&&(()=>t.lineFeatures),n.lines.getPath=jr,n.polygons.data=a,n.polygons._dataDiff=t.polygonFeatures&&(()=>t.polygonFeatures),n.polygons.getPolygon=jr,n.polygonsOutline.data=o,n.polygonsOutline._dataDiff=t.polygonOutlineFeatures&&(()=>t.polygonOutlineFeatures),n.polygonsOutline.getPath=jr,n}function Nr(e,t){let n=Ar(),{points:r,lines:i,polygons:a}=e,o=Dn(e,t);n.points.data={length:r.positions.value.length/r.positions.size,attributes:{...r.attributes,getPosition:r.positions,instancePickingColors:{size:4,value:o.points}},properties:r.properties,numericProps:r.numericProps,featureIds:r.featureIds},n.lines.data={length:i.pathIndices.value.length-1,startIndices:i.pathIndices.value,attributes:{...i.attributes,getPath:i.positions,instancePickingColors:{size:4,value:o.lines}},properties:i.properties,numericProps:i.numericProps,featureIds:i.featureIds},n.lines._pathType=`open`;let s=a.positions.value.length/a.positions.size,c=Array(s).fill(1);for(let e of a.primitivePolygonIndices.value)c[e-1]=0;return n.polygons.data={length:a.polygonIndices.value.length-1,startIndices:a.polygonIndices.value,attributes:{...a.attributes,getPolygon:a.positions,instanceVertexValid:{size:1,value:new Uint16Array(c)},pickingColors:{size:4,value:o.polygons}},properties:a.properties,numericProps:a.numericProps,featureIds:a.featureIds},n.polygons._normalize=!1,a.triangles&&(n.polygons.data.attributes.indices=a.triangles.value),n.polygonsOutline.data={length:a.primitivePolygonIndices.value.length-1,startIndices:a.primitivePolygonIndices.value,attributes:{...a.attributes,getPath:a.positions,instancePickingColors:{size:4,value:o.polygons}},properties:a.properties,numericProps:a.numericProps,featureIds:a.featureIds},n.polygonsOutline._pathType=`open`,n}var Pr=[`points`,`linestrings`,`polygons`],Fr={...$(xr.circle),...$(xr.icon),...$(xr.text),...$(Sr),...$(Cr),stroked:!0,filled:!0,extruded:!1,wireframe:!1,_full3d:!1,iconAtlas:{type:`object`,value:null},iconMapping:{type:`object`,value:{}},getIcon:{type:`accessor`,value:e=>e.properties.icon},getText:{type:`accessor`,value:e=>e.properties.text},pointType:`circle`,getRadius:{deprecatedFor:`getPointRadius`}},Ir=class extends u{initializeState(){this.state={layerProps:{},features:{},featuresDiff:{}}}updateState({props:e,changeFlags:t}){if(!t.dataChanged)return;let{data:n}=this.props,r=n&&`points`in n&&`polygons`in n&&`lines`in n;this.setState({binary:r}),r?this._updateStateBinary({props:e,changeFlags:t}):this._updateStateJSON({props:e,changeFlags:t})}_updateStateBinary({props:e,changeFlags:t}){let n=Nr(e.data,this.encodePickingColor);this.setState({layerProps:n})}_updateStateJSON({props:e,changeFlags:t}){let n=Tr(e.data),r=this.getSubLayerRow.bind(this),i={},a={};if(Array.isArray(t.dataChanged)){let e=this.state.features;for(let t in e)i[t]=e[t].slice(),a[t]=[];for(let o of t.dataChanged){let t=Er(n,r,o);for(let n in e)a[n].push(xn({data:i[n],getIndex:e=>e.__source.index,dataRange:o,replace:t[n]}))}}else i=Er(n,r);let o=Mr(i,a);this.setState({features:i,featuresDiff:a,layerProps:o})}getPickingInfo(e){let t=super.getPickingInfo(e),{index:n,sourceLayer:r}=t;return t.featureType=Pr.find(e=>r.id.startsWith(`${this.id}-${e}-`)),n>=0&&r.id.startsWith(`${this.id}-points-text`)&&this.state.binary&&(t.index=this.props.data.points.globalFeatureIds.value[n]),t}_updateAutoHighlight(e){let t=`${this.id}-points-`,n=e.featureType===`points`;for(let r of this.getSubLayers())r.id.startsWith(t)===n&&r.updateAutoHighlight(e)}_renderPolygonLayer(){let{extruded:e,wireframe:t}=this.props,{layerProps:n}=this.state,r=`polygons-fill`,i=this.shouldRenderSubLayer(r,n.polygons?.data)&&this.getSubLayerClass(r,Cr.type);if(i){let a=wr(this,Cr.props),o=e&&t;return o||delete a.getLineColor,a.updateTriggers.lineColors=o,new i(a,this.getSubLayerProps({id:r,updateTriggers:a.updateTriggers}),n.polygons)}return null}_renderLineLayers(){let{extruded:e,stroked:t}=this.props,{layerProps:n}=this.state,r=`polygons-stroke`,i=`linestrings`,a=!e&&t&&this.shouldRenderSubLayer(r,n.polygonsOutline?.data)&&this.getSubLayerClass(r,Sr.type),o=this.shouldRenderSubLayer(i,n.lines?.data)&&this.getSubLayerClass(i,Sr.type);if(a||o){let e=wr(this,Sr.props);return[a&&new a(e,this.getSubLayerProps({id:r,updateTriggers:e.updateTriggers}),n.polygonsOutline),o&&new o(e,this.getSubLayerProps({id:i,updateTriggers:e.updateTriggers}),n.lines)]}return null}_renderPointLayers(){let{pointType:e}=this.props,{layerProps:t,binary:n}=this.state,{highlightedObjectIndex:r}=this.props;!n&&Number.isFinite(r)&&(r=t.points.data.findIndex(e=>e.__source.index===r));let i=new Set(e.split(`+`)),a=[];for(let e of i){let i=`points-${e}`,o=xr[e],s=o&&this.shouldRenderSubLayer(i,t.points?.data)&&this.getSubLayerClass(i,o.type);if(s){let c=wr(this,o.props),l=t.points;if(e===`text`&&n){let{instancePickingColors:e,...t}=l.data.attributes;l={...l,data:{...l.data,attributes:t}}}a.push(new s(c,this.getSubLayerProps({id:i,updateTriggers:c.updateTriggers,highlightedObjectIndex:r}),l))}}return a}renderLayers(){let{extruded:e}=this.props,t=this._renderPolygonLayer(),n=this._renderLineLayers(),r=this._renderPointLayers();return[!e&&t,n,r,e&&t]}getSubLayerAccessor(e){let{binary:t}=this.state;return!t||typeof e!=`function`?super.getSubLayerAccessor(e):(t,n)=>{let{data:r,index:i}=n;return e(Tn(r,i),n)}}};Ir.layerName=`GeoJsonLayer`,Ir.defaultProps=Fr;export{P as ArcLayer,de as BitmapLayer,U as ColumnLayer,Ir as GeoJsonLayer,Ft as GridCellLayer,I as IconLayer,Be as LineLayer,W as PathLayer,Xe as PointCloudLayer,wn as PolygonLayer,L as ScatterplotLayer,J as SolidPolygonLayer,br as TextLayer,Fn as _MultiIconLayer,Q as _TextBackgroundLayer};