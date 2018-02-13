import { Stats } from "fs";
import {
  AbsolutePath,
  CanonicalPath,
  DirectoryResolution,
  FileResolution,
  InputDirectoryResolution,
  InputFileResolution,
  MergedDirectoryResolution,
  PathInfo,
  Resolution,
} from "../interfaces";
import { stat } from "./file-utils";

export default function resolve(pathInfo: PathInfo): Resolution {
  let flags = ResolutionFlags.None;
  let stats: Stats | undefined;
  let otherStats: Stats | undefined;
  if (pathInfo.pathInInput) {
    stats = stat(pathInfo.pathInInput);
    if (stats !== undefined) {
      flags |= ResolutionFlags.Input;
    }
  }
  if (stats === undefined) {
    stats = stat(pathInfo.path);
  }
  if (stats !== undefined) {
    flags |= stats.isDirectory() ? ResolutionFlags.Dir : ResolutionFlags.File;
  }
  if ((flags & ResolutionFlags.InputDir) === ResolutionFlags.InputDir) {
    otherStats = stat(pathInfo.path);
    if (otherStats !== undefined && otherStats.isDirectory()) {
      flags |= ResolutionFlags.Merge;
    }
  }
  return new ResolutionImpl(pathInfo, stats, otherStats, flags);
}

const enum ResolutionFlags {
  None   = 0,
  File   = 1 << 0,
  Dir    = 1 << 1,
  Input  = 1 << 2,
  Merge = 1 << 3,
  InputDir = Dir | Input,
}

class ResolutionImpl implements Resolution {
  public canonicalPath: CanonicalPath;
  public canonicalPathInInput: CanonicalPath | undefined;
  public path: AbsolutePath;
  public pathInInput: AbsolutePath | undefined;
  public relativePath: string | undefined;

  constructor(
    pathInfo: PathInfo,
    public stats: Stats | undefined,
    public otherStats: Stats | undefined,
    private flags: ResolutionFlags,
  ) {
    this.canonicalPath = pathInfo.canonicalPath;
    this.canonicalPathInInput = pathInfo.canonicalPathInInput;
    this.path = pathInfo.path;
    this.pathInInput = pathInfo.pathInInput;
    this.relativePath = pathInfo.relativePath;
  }

  public isInput(): this is InputDirectoryResolution | InputFileResolution {
    return this.hasFlag(ResolutionFlags.Input);
  }

  public isFile(): this is FileResolution | InputFileResolution {
    return this.hasFlag(ResolutionFlags.File);
  }

  public isDirectory(): this is DirectoryResolution | InputDirectoryResolution {
    return this.hasFlag(ResolutionFlags.Dir);
  }

  public isMerged(): this is MergedDirectoryResolution {
    return this.hasFlag(ResolutionFlags.File);
  }

  public exists(): this is FileResolution | DirectoryResolution {
    return this.stats !== undefined;
  }

  private hasFlag(flag: ResolutionFlags) {
    return (this.flags & flag) === flag;
  }
}
