import { default as CopyPlugin } from 'copy-webpack-plugin';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { pathToFileURL } from 'node:url';
import { Compiler, DefinePlugin, webpack } from 'webpack';
import { default as WebpackDevServer } from 'webpack-dev-server';
import { default as ForkTsCheckerPlugin } from 'fork-ts-checker-webpack-plugin';
import { default as HtmlPlugin } from 'html-webpack-plugin';

function createCompiler(production: boolean): Compiler {
  return webpack({
    mode: production ? 'production' : 'development',
    target: 'web',
    devtool: production ? false : 'source-map',
    context: cwd(),
    entry: {
      'index': resolve('index.tsx'),
    },
    output: {
      clean: production,
      path: resolve('../dist'),
      publicPath: process.env.PUBLIC_PATH,
      filename: production ? '[contenthash].js' : '[name].[contenthash:4].js',
      chunkFilename: production ? '[contenthash].js' : '[name].[contenthash:4].js',
      sourceMapFilename: production ? '[contenthash].json' : '[name].[contenthash:4].json',
      assetModuleFilename: production ? '[contenthash][ext]' : '[name].[contenthash:4][ext]',
      cssFilename: production ? '[contenthash].css' : '[name].[contenthash:4].css',
      cssChunkFilename: production ? '[contenthash].css' : '[name].[contenthash:4].css',
      devtoolModuleFilenameTemplate: (info: any) => pathToFileURL(info.absoluteResourcePath),
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx'],
      mainFields: ['module', 'main'],
    },
    module: {
      rules: [
        {
          resourceQuery: /(^\?|\&)resource(\&|$)/,
          type: 'asset/resource',
        },
        {
          test: /\.tsx?$/i,
          use: {
            loader: require.resolve('ts-loader'),
            options: { // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#options
              configFile: resolve('tsconfig.json'), // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#configfile
              transpileOnly: true, // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#transpileonly
              compilerOptions: { // https://github.com/TypeStrong/ts-loader?tab=readme-ov-file#compileroptions
                sourceMap: true,
                target: 'es2022',
              },
            },
          },
        },
        {
          test: /\.css$/i,
          use: [
            require.resolve('style-loader'),
            require.resolve('css-loader'),
          ],
        }
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [{
          from: resolve('../public'),
          noErrorOnMissing: true,
        }],
      }),
      new DefinePlugin({
        
      }),
      new ForkTsCheckerPlugin({
        typescript: {
          configFile: resolve('tsconfig.json'),
        },
      }),
      new HtmlPlugin({
        chunks: ['index'],
        template: resolve('index.html'),
        filename: 'index.html',
      }),
    ],
  });
}

function serve(port: number) {
  const compiler = createCompiler(false);
  const devServer = new WebpackDevServer({
    port,
    hot: true,
    liveReload: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    historyApiFallback: true,
  }, compiler);

  devServer.start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

function build() {
  const compiler = createCompiler(true);
  compiler.run((error, stats) => {
    if (error || !stats) {
      console.error(error);
      process.exit(1);
    }
    console.log(stats.toString({
      preset: 'normal',
      colors: true,
    }));
  });
}

if (require.main === module) {
  switch (process.argv[2]) {
    case 'serve': {
      serve(3000);
      break;
    }
    case 'build': {
      build();  
      break;
    }
    default: {
      console.warn(process.argv);
      process.exit(1);
    }
  }
}