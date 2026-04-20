export interface ControllerState {
  vx: number;
  vy: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
  facing: 1 | -1;
}

export interface ControllerInput {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
}

export interface Contacts {
  onGround: boolean;
  onCeiling: boolean;
  onLeftWall: boolean;
  onRightWall: boolean;
}

export interface ControllerConfig {
  runSpeed: number;
  jumpVelocity: number;
  coyoteTimeSec: number;
  jumpBufferSec: number;
}

export function updateController(
  prev: ControllerState,
  input: ControllerInput,
  contacts: Contacts,
  dt: number,
  cfg: ControllerConfig,
): ControllerState {
  let vx = 0;
  let facing: 1 | -1 = prev.facing;
  if (input.right) { vx = cfg.runSpeed; facing = 1; }
  if (input.left) { vx = -cfg.runSpeed; facing = -1; }

  let vy = prev.vy;
  if (contacts.onGround && vy > 0) vy = 0;
  if (contacts.onCeiling && vy < 0) vy = 0;

  let coyoteTimer = contacts.onGround
    ? cfg.coyoteTimeSec
    : Math.max(0, prev.coyoteTimer - dt);

  const seededBuffer = input.jumpPressed ? cfg.jumpBufferSec : prev.jumpBufferTimer;
  let jumpBufferTimer = Math.max(0, seededBuffer - dt);

  const canJump = coyoteTimer > 0;
  const wantsJump = jumpBufferTimer > 0;
  if (canJump && wantsJump) {
    vy = cfg.jumpVelocity;
    coyoteTimer = 0;
    jumpBufferTimer = 0;
  }

  return { vx, vy, coyoteTimer, jumpBufferTimer, facing };
}
