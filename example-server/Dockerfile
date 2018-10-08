FROM node:10.11.0-stretch

COPY . /app
WORKDIR /app

ENV LANG en_US.UTF-8

RUN set -ex && \
    buildDeps=' \
      liblldb-6.0-dev \
    ' && \
    runtimeDeps=' \
      zsh \
      vim \
      lldb-6.0 \
      tmux \
      locales \
      gdb \
    ' && \
    tmuxConfig=' \
      set-option -g default-shell /bin/zsh \n\
      set -g mouse \n\
    ' && \
    vimConfig=' \
      set background=dark \n\
      set number \n\
      set ts=2 \n\
      set sw=2 \n\
      set expandtab \n\
      set nowrap \n\
    ' && \
    llvmRepository='#6.0\n\
deb http://apt.llvm.org/stretch/ llvm-toolchain-stretch-6.0 main\n\
deb-src http://apt.llvm.org/stretch/ llvm-toolchain-stretch-6.0 main\n' && \
    echo $llvmRepository >> /etc/apt/sources.list && \
    wget -O - https://apt.llvm.org/llvm-snapshot.gpg.key | apt-key add - && \
    apt-get update && \
    apt-get install -y $runtimeDeps $buildDeps && \
    ln -s $(which lldb-6.0) /usr/local/bin/lldb && \
    rm -rf /var/lib/apt/lists/* && \
    echo "$tmuxConfig" >> /etc/tmux.conf && \
    echo "$vimConfig" >> /root/.vimrc && \
    sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8 && \
    npm install --unsafe-perm -g mmarchini/llnode#js-interactive-workshop localtunnel && \
    npm ci && \
    mv node_modules ../

RUN wget https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O - | zsh || true

CMD /bin/zsh
